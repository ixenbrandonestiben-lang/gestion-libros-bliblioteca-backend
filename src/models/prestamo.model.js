import pool from '../config/db.js';

const enTransaccion = async (operacion) => {
    const conexion = await pool.getConnection();
    let transaccionIniciada = false;

    try {
        await conexion.beginTransaction();
        transaccionIniciada = true;

        const resultado = await operacion(conexion);

        await conexion.commit();
        transaccionIniciada = false;
        return resultado;
    } catch (error) {
        if (transaccionIniciada) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                throw new AggregateError(
                    [error, errorRollback],
                    'Falló la operación del préstamo y también su reversión'
                );
            }
        }

        throw error;
    } finally {
        conexion.release();
    }
};

const buscarClienteParaActualizar = async (conexion, idCliente) => {
    const [filas] = await conexion.execute(
        `SELECT id_cliente, estado_cuenta
         FROM clientes
         WHERE id_cliente = ?
         FOR UPDATE`,
        [idCliente]
    );

    return filas[0] ?? null;
};

const buscarPrestamosVencidos = async (conexion, idCliente) => {
    const [filas] = await conexion.execute(
        `SELECT id_prestamo
         FROM prestamos
         WHERE id_cliente = ?
           AND fecha_devolucion_real IS NULL
           AND fecha_devolucion_esperada < CURRENT_DATE()
           AND estado_prestamo IN ('ACTIVO', 'VENCIDO')
         ORDER BY id_prestamo
         FOR UPDATE`,
        [idCliente]
    );

    return filas.map(({ id_prestamo: idPrestamo }) => idPrestamo);
};

const marcarPrestamosVencidos = async (conexion, idsPrestamo) => {
    if (idsPrestamo.length === 0) {
        return;
    }

    const placeholders = idsPrestamo.map(() => '?').join(', ');
    await conexion.execute(
        `UPDATE prestamos
         SET estado_prestamo = 'VENCIDO'
         WHERE id_prestamo IN (${placeholders})
           AND estado_prestamo = 'ACTIVO'`,
        idsPrestamo
    );
};

const bloquearClientePorMora = async (conexion, idCliente) => {
    await conexion.execute(
        `UPDATE clientes
         SET estado_cuenta = 'BLOQUEADO_POR_MORA'
         WHERE id_cliente = ?
           AND estado_cuenta = 'ACTIVO'`,
        [idCliente]
    );
};

const validarFechaDevolucion = async (conexion, fecha) => {
    const [filas] = await conexion.execute(
        'SELECT (? > CURRENT_DATE()) AS fecha_valida',
        [fecha]
    );

    return Boolean(filas[0]?.fecha_valida);
};

const buscarLibrosParaActualizar = async (conexion, idsLibro) => {
    const idsUnicos = [...new Set(idsLibro)].sort((a, b) => a - b);
    const placeholders = idsUnicos.map(() => '?').join(', ');
    const [filas] = await conexion.execute(
        `SELECT id_libro, stock
         FROM libros
         WHERE id_libro IN (${placeholders})
         ORDER BY id_libro
         FOR UPDATE`,
        idsUnicos
    );

    return filas;
};

const descontarStock = async (conexion, idLibro, cantidad) => {
    const [resultado] = await conexion.execute(
        `UPDATE libros
         SET stock = stock - ?
         WHERE id_libro = ?
           AND stock >= ?`,
        [cantidad, idLibro, cantidad]
    );

    return resultado.affectedRows > 0;
};

const crearEncabezado = async (conexion, prestamo) => {
    const [resultado] = await conexion.execute(
        `INSERT INTO prestamos (
            id_cliente,
            fecha_prestamo,
            fecha_devolucion_esperada,
            estado_prestamo,
            id_empleado_despacha
         )
         VALUES (?, CURRENT_DATE(), ?, 'ACTIVO', ?)`,
        [
            prestamo.id_cliente,
            prestamo.fecha_devolucion_esperada,
            prestamo.id_empleado_despacha
        ]
    );

    return resultado.insertId;
};

const crearDetalles = async (conexion, idPrestamo, libros) => {
    const placeholders = libros.map(() => '(?, ?, ?)').join(', ');
    const valores = libros.flatMap((libro) => [
        idPrestamo,
        libro.id_libro,
        libro.estado_libro_salida ?? 'BUENO'
    ]);

    await conexion.execute(
        `INSERT INTO detalle_prestamos (
            id_prestamo,
            id_libro,
            estado_libro_salida
         )
         VALUES ${placeholders}`,
        valores
    );
};

const buscarPrestamoCreado = async (conexion, idPrestamo) => {
    const [prestamos] = await conexion.execute(
        `SELECT id_prestamo, id_cliente, fecha_prestamo,
                fecha_devolucion_esperada, fecha_devolucion_real,
                estado_prestamo, multa_acumulada, id_empleado_despacha,
                created_at
         FROM prestamos
         WHERE id_prestamo = ?`,
        [idPrestamo]
    );

    const [libros] = await conexion.execute(
        `SELECT id_detalle_prestamo, id_libro, estado_libro_salida,
                estado_libro_entrada
         FROM detalle_prestamos
         WHERE id_prestamo = ?
         ORDER BY id_detalle_prestamo`,
        [idPrestamo]
    );

    return { ...prestamos[0], libros };
};

const listar = async ({ page, limit, idCliente }) => {
    const conexion = pool;
    const offset = (page - 1) * limit;
    const filtro = idCliente === undefined ? '' : 'WHERE id_cliente = ?';
    const valoresFiltro = idCliente === undefined ? [] : [idCliente];
    const [prestamos] = await conexion.execute(
        `SELECT id_prestamo, id_cliente, fecha_prestamo,
                fecha_devolucion_esperada, fecha_devolucion_real,
                estado_prestamo, multa_acumulada, id_empleado_despacha,
                created_at
         FROM prestamos
         ${filtro}
         ORDER BY id_prestamo DESC
         LIMIT ? OFFSET ?`,
        [...valoresFiltro, limit, offset]
    );
    const [conteo] = await conexion.execute(
        `SELECT COUNT(*) AS total FROM prestamos ${filtro}`,
        valoresFiltro
    );

    let libros = [];
    if (prestamos.length > 0) {
        const ids = prestamos.map(({ id_prestamo: id }) => id);
        const placeholders = ids.map(() => '?').join(', ');
        const [filasLibros] = await conexion.execute(
            `SELECT id_detalle_prestamo, id_prestamo, id_libro,
                    estado_libro_salida, estado_libro_entrada
             FROM detalle_prestamos
             WHERE id_prestamo IN (${placeholders})
             ORDER BY id_detalle_prestamo`,
            ids
        );
        libros = filasLibros;
    }

    return {
        prestamos,
        total: Number(conteo[0].total),
        libros
    };
};

const buscarPorId = async (idPrestamo) => {
    const [prestamos] = await pool.execute(
        `SELECT id_prestamo, id_cliente, fecha_prestamo,
                fecha_devolucion_esperada, fecha_devolucion_real,
                estado_prestamo, multa_acumulada, id_empleado_despacha,
                created_at
         FROM prestamos
         WHERE id_prestamo = ?`,
        [idPrestamo]
    );

    if (!prestamos[0]) {
        return null;
    }

    const [libros] = await pool.execute(
        `SELECT id_detalle_prestamo, id_libro,
                estado_libro_salida, estado_libro_entrada
         FROM detalle_prestamos
         WHERE id_prestamo = ?
         ORDER BY id_detalle_prestamo`,
        [idPrestamo]
    );

    return { ...prestamos[0], libros };
};

const devolver = async (idPrestamo, librosDevueltos) => enTransaccion(async (conexion) => {
    const [prestamos] = await conexion.execute(
        `SELECT id_prestamo, fecha_devolucion_real
         FROM prestamos
         WHERE id_prestamo = ?
         FOR UPDATE`,
        [idPrestamo]
    );

    if (!prestamos[0]) {
        return { notFound: true };
    }
    if (prestamos[0].fecha_devolucion_real !== null) {
        return { alreadyReturned: true };
    }

    const [detalles] = await conexion.execute(
        `SELECT id_detalle_prestamo, id_libro
         FROM detalle_prestamos
         WHERE id_prestamo = ?
           AND estado_libro_entrada IS NULL
         ORDER BY id_detalle_prestamo
         FOR UPDATE`,
        [idPrestamo]
    );
    const idsEsperados = detalles.map(({ id_detalle_prestamo: id }) => id).sort((a, b) => a - b);
    const idsEnviados = librosDevueltos
        .map(({ id_detalle_prestamo: id }) => id)
        .sort((a, b) => a - b);

    if (
        idsEsperados.length === 0
        || idsEsperados.length !== idsEnviados.length
        || idsEsperados.some((id, index) => id !== idsEnviados[index])
    ) {
        return { invalidDetails: true };
    }

    const estadoPorDetalle = new Map(
        librosDevueltos.map((libro) => [
            libro.id_detalle_prestamo,
            libro.estado_libro_entrada
        ])
    );

    for (const detalle of detalles) {
        const estadoEntrada = estadoPorDetalle.get(detalle.id_detalle_prestamo);
        await conexion.execute(
            `UPDATE detalle_prestamos
             SET estado_libro_entrada = ?
             WHERE id_detalle_prestamo = ?`,
            [estadoEntrada, detalle.id_detalle_prestamo]
        );

        if (estadoEntrada !== 'PERDIDO') {
            await conexion.execute(
                'UPDATE libros SET stock = stock + 1 WHERE id_libro = ?',
                [detalle.id_libro]
            );
        }
    }

    await conexion.execute(
        `UPDATE prestamos
         SET fecha_devolucion_real = CURRENT_DATE(),
             estado_prestamo = 'DEVUELTO'
         WHERE id_prestamo = ?`,
        [idPrestamo]
    );

    return {
        prestamo: await buscarPrestamoCreado(conexion, idPrestamo)
    };
});

export default {
    enTransaccion,
    buscarClienteParaActualizar,
    buscarPrestamosVencidos,
    marcarPrestamosVencidos,
    bloquearClientePorMora,
    validarFechaDevolucion,
    buscarLibrosParaActualizar,
    descontarStock,
    crearEncabezado,
    crearDetalles,
    buscarPrestamoCreado,
    listar,
    buscarPorId,
    devolver
};