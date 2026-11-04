import pool from '../config/db.js';

const listar = async () => {
    const [generos] = await pool.execute(
        `SELECT id_genero, nombre_genero, created_at
         FROM generos_literarios
         ORDER BY id_genero`
    );

    return generos;
};

const buscarPorId = async (id) => {
    const [generos] = await pool.execute(
        `SELECT id_genero, nombre_genero, created_at
         FROM generos_literarios
         WHERE id_genero = ?`,
        [id]
    );

    return generos[0] ?? null;
};

const crear = async (nombreGenero) => {
    const [resultado] = await pool.execute(
        'INSERT INTO generos_literarios (nombre_genero) VALUES (?)',
        [nombreGenero]
    );

    return resultado.insertId;
};

const actualizar = async (id, nombreGenero) => {
    const [resultado] = await pool.execute(
        'UPDATE generos_literarios SET nombre_genero = ? WHERE id_genero = ?',
        [nombreGenero, id]
    );

    return resultado.affectedRows > 0;
};

const eliminar = async (id) => {
    const [resultado] = await pool.execute(
        'DELETE FROM generos_literarios WHERE id_genero = ?',
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
