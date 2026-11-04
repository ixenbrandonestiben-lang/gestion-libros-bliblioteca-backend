import pool from '../config/db.js';

const columnas = 'id_autor, nombre_autor, created_at';

const listar = async () => {
    const [autores] = await pool.execute(
        `SELECT ${columnas} FROM autores ORDER BY id_autor`
    );

    return autores;
};

const buscarPorId = async (id) => {
    const [autores] = await pool.execute(
        `SELECT ${columnas} FROM autores WHERE id_autor = ?`,
        [id]
    );

    return autores[0] ?? null;
};

const crear = async (nombre) => {
    const [resultado] = await pool.execute(
        'INSERT INTO autores (nombre_autor) VALUES (?)',
        [nombre]
    );

    return resultado.insertId;
};

const actualizar = async (id, nombre) => {
    const [resultado] = await pool.execute(
        'UPDATE autores SET nombre_autor = ? WHERE id_autor = ?',
        [nombre, id]
    );

    return resultado.affectedRows > 0;
};

const eliminar = async (id) => {
    const [resultado] = await pool.execute(
        'DELETE FROM autores WHERE id_autor = ?',
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
