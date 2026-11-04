import pool from '../config/db.js';

const listar = async () => {
    const [editoriales] = await pool.execute(
        `SELECT id_editorial, nombre_editorial, created_at
         FROM editoriales
         ORDER BY id_editorial`
    );

    return editoriales;
};

const buscarPorId = async (id) => {
    const [editoriales] = await pool.execute(
        `SELECT id_editorial, nombre_editorial, created_at
         FROM editoriales
         WHERE id_editorial = ?`,
        [id]
    );

    return editoriales[0] ?? null;
};

const crear = async (nombreEditorial) => {
    const [resultado] = await pool.execute(
        'INSERT INTO editoriales (nombre_editorial) VALUES (?)',
        [nombreEditorial]
    );

    return resultado.insertId;
};

const actualizar = async (id, nombreEditorial) => {
    const [resultado] = await pool.execute(
        'UPDATE editoriales SET nombre_editorial = ? WHERE id_editorial = ?',
        [nombreEditorial, id]
    );

    return resultado.affectedRows > 0;
};

const eliminar = async (id) => {
    const [resultado] = await pool.execute(
        'DELETE FROM editoriales WHERE id_editorial = ?',
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
