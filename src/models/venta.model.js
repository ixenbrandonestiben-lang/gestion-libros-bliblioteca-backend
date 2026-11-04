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
                    'Falló la venta y también su reversión'
                );
            }
        }

        throw error;
    } finally {
        conexion.release();
    }
};

const buscarClientesParaActualizar = async (conexion, idsCliente) => {
    const idsUnicos = [...new Set(idsCliente)].sort((a, b) => a - b);
    const placeholders = idsUnicos.map(() => '?').join(', ');
    const [filas] = await conexion.execute(
        `SELECT id_cliente, rol, estado_cuenta
         FROM clientes
         WHERE id_cliente IN (${placeholders})
         ORDER BY id_cliente
         FOR UPDATE`,
        idsUnicos
    );

    return filas;
};

const buscarLibrosParaActualizar = async (conexion, idsLibro) => {
    const idsUnicos = [...new Set(idsLibro)].sort((a, b) => a - b);
    const placeholders = idsUnicos.map(() => '?').join(', ');
    const [filas] = await conexion.execute(
        `SELECT id_libro, titulo, precio, stock
         FROM libros
         WHERE id_libro IN (${placeholders})
         ORDER BY id_libro
         FOR UPDATE`,
        idsUnicos
    );

    return filas;
};

const crearEncabezado = async (conexion, venta) => {
    const [resultado] = await conexion.execute(
        `INSERT INTO ventas (id_cliente, total, id_empleado_cajero)
         VALUES (?, 0.00, ?)`,
        [venta.id_cliente, venta.id_empleado_cajero]
    );

    return resultado.insertId;
};

const crearDetalles = async (conexion, idVenta, items, libros) => {
    const libroPorId = new Map(
        libros.map((libro) => [libro.id_libro, libro])
    );
    const placeholders = items.map(() => '(?, ?, ?, ?)').join(', ');
    const valores = items.flatMap((item) => [
        idVenta,
        item.id_libro,
        item.cantidad,
        libroPorId.get(item.id_libro).precio
    ]);

    await conexion.execute(
        `INSERT INTO detalle_ventas (
            id_venta,
            id_libro,
            cantidad,
            precio_unitario_historico
         )
         VALUES ${placeholders}`,
        valores
    );
};

const descontarStock = async (conexion, idLibro, cantidad) => {
    const [resultado] = await conexion.execute(
        `UPDATE libros
         SET stock = stock - ?
         WHERE id_libro = ?
           AND stock >= ?`,
        [cantidad, idLibro, cantidad]
    );

    return resultado.affectedRows === 1;
};

const calcularTotal = async (conexion, idVenta) => {
    const [filas] = await conexion.execute(
        `SELECT CAST(COALESCE(SUM(subtotal), 0.00) AS DECIMAL(10, 2)) AS total
         FROM detalle_ventas
         WHERE id_venta = ?`,
        [idVenta]
    );

    return filas[0].total;
};

const actualizarTotal = async (conexion, idVenta, total) => {
    await conexion.execute(
        'UPDATE ventas SET total = ? WHERE id_venta = ?',
        [total, idVenta]
    );

    return true;
};

const buscarDetalles = async (conexion, idsVenta) => {
    if (idsVenta.length === 0) {
        return [];
    }

    const ejecutor = conexion ?? pool;
    const placeholders = idsVenta.map(() => '?').join(', ');
    const [filas] = await ejecutor.execute(
        `SELECT dv.id_venta, dv.id_detalle_venta, dv.id_libro,
                l.titulo, dv.cantidad, dv.precio_unitario_historico,
                dv.subtotal
         FROM detalle_ventas AS dv
         INNER JOIN libros AS l ON l.id_libro = dv.id_libro
         WHERE dv.id_venta IN (${placeholders})
         ORDER BY dv.id_venta, dv.id_detalle_venta`,
        idsVenta
    );

    return filas;
};

const listarVentas = async (limit, offset) => {
    const [ventas] = await pool.execute(
        `SELECT id_venta, id_cliente, fecha_venta, total, id_empleado_cajero
         FROM ventas
         ORDER BY fecha_venta DESC, id_venta DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );

    return ventas;
};

const contarVentas = async () => {
    const [filas] = await pool.execute(
        'SELECT COUNT(*) AS total FROM ventas'
    );

    return filas[0].total;
};

const buscarVentaPorId = async (id) => {
    const [ventas] = await pool.execute(
        `SELECT id_venta, id_cliente, fecha_venta, total, id_empleado_cajero
         FROM ventas
         WHERE id_venta = ?`,
        [id]
    );

    return ventas[0] ?? null;
};

const buscarDetallesPorVenta = async (id) => {
    const [detalles] = await pool.execute(
        `SELECT dv.id_detalle_venta, dv.id_libro, l.titulo,
                dv.cantidad, dv.precio_unitario_historico, dv.subtotal
         FROM detalle_ventas AS dv
         INNER JOIN libros AS l ON l.id_libro = dv.id_libro
         WHERE dv.id_venta = ?
         ORDER BY dv.id_detalle_venta`,
        [id]
    );

    return detalles;
};

export default {
    enTransaccion,
    buscarClientesParaActualizar,
    buscarLibrosParaActualizar,
    crearEncabezado,
    crearDetalles,
    descontarStock,
    calcularTotal,
    actualizarTotal,
    buscarDetalles,
    listarVentas,
    contarVentas,
    buscarVentaPorId,
    buscarDetallesPorVenta
};