import pool from '../config/db.js';

const columnas = `
    id_libro,
    titulo,
    isbn,
    anio_publicacion,
    paginas,
    idioma_escritura,
    precio,
    stock,
    id_autor,
    id_editorial,
    id_genero,
    estado_disponibilidad,
    created_at,
    updated_at
`;

const columnasActualizables = new Set([
    'titulo',
    'isbn',
    'anio_publicacion',
    'paginas',
    'idioma_escritura',
    'precio',
    'stock',
    'id_autor',
    'id_editorial',
    'id_genero'
]);

const listar = async () => {
    const [libros] = await pool.execute(
        `SELECT ${columnas} FROM libros ORDER BY id_libro`
    );

    return libros;
};

const buscarPorId = async (id) => {
    const [libros] = await pool.execute(
        `SELECT ${columnas} FROM libros WHERE id_libro = ?`,
        [id]
    );

    return libros[0] ?? null;
};

const crear = async (libro) => {
    const campos = [
        'titulo',
        'isbn',
        'anio_publicacion',
        'paginas',
        'idioma_escritura',
        'precio',
        'stock',
        'id_autor',
        'id_editorial',
        'id_genero'
    ];
    const valores = campos.map((campo) => {
        if (campo === 'stock' && libro[campo] === undefined) {
            return 0;
        }

        return libro[campo] ?? null;
    });

    const [resultado] = await pool.execute(
        `INSERT INTO libros (${campos.join(', ')})
         VALUES (${campos.map(() => '?').join(', ')})`,
        valores
    );

    return resultado.insertId;
};

const actualizar = async (id, cambios) => {
    const entradas = Object.entries(cambios).filter(([columna]) =>
        columnasActualizables.has(columna)
    );

    if (entradas.length === 0) {
        return false;
    }

    const asignaciones = entradas
        .map(([columna]) => `${columna} = ?`)
        .join(', ');
    const valores = entradas.map(([, valor]) => valor);
    const [resultado] = await pool.execute(
        `UPDATE libros SET ${asignaciones} WHERE id_libro = ?`,
        [...valores, id]
    );

    return resultado.affectedRows > 0;
};

const eliminar = async (id) => {
    const [resultado] = await pool.execute(
        'DELETE FROM libros WHERE id_libro = ?',
        [id]
    );

    return resultado.affectedRows > 0;
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};