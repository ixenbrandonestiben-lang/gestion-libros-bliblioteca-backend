import database from '../config/db.js';

export default class AutorDTO {
    #database;

    constructor({ database: databaseInyectada = database } = {}) {
        this.#database = databaseInyectada;
    }

    async listar() {
        const [filas] = await this.#database.execute(
            `
            SELECT id_autor, nombre_autor
            FROM autores
            ORDER BY id_autor
            `
        );

        return filas;
    }

    async buscarPorId(id_autor) {
        const [filas] = await this.#database.execute(
            `
            SELECT id_autor, nombre_autor
            FROM autores
            WHERE id_autor = ?
            `,
            [id_autor]
        );

        return filas[0] ?? null;
    }

    async crear(nombre_autor) {
        const [resultado] = await this.#database.execute(
            `
            INSERT INTO autores (nombre_autor)
            VALUES (?)
            `,
            [nombre_autor]
        );

        return resultado.insertId;
    }

    async actualizar(id_autor, nombre_autor) {
        const [resultado] = await this.#database.execute(
            `
            UPDATE autores
            SET nombre_autor = ?
            WHERE id_autor = ?
            `,
            [nombre_autor, id_autor]
        );

        return resultado.affectedRows > 0;
    }

    async eliminar(id_autor) {
        const [resultado] = await this.#database.execute(
            `
            DELETE FROM autores
            WHERE id_autor = ?
            `,
            [id_autor]
        );

        return resultado.affectedRows > 0;
    }
}
