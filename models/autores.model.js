import { pool } from '../config/db.js';
import AutoresDTO from '../dto/autores.dto.js';

export class Autores {
    constructor(database = pool) {
        this.database = database;
    }

    async listar() {
        const [rows] = await this.database.execute(
            `
            SELECT *
            FROM autores
            ORDER BY id_autor
            `
        );

        return rows.map((row) => new AutoresDTO(row).data);
    }

    async buscarPorId(id) {
        const [rows] = await this.database.execute(
            `
            SELECT *
            FROM autores
            WHERE id_autor = ?
            `,
            [id]
        );

        return rows.length === 0
            ? null
            : new AutoresDTO(rows[0]).data;
    }

    async crear(datos) {
        const autor = new AutoresDTO(datos);
        const [result] = await this.database.execute(
            `
            INSERT INTO autores (nombre_autor)
            VALUES (?)
            `,
            [autor.nombre_autor]
        );

        return new AutoresDTO({
            id_autor: result.insertId,
            nombre_autor: autor.nombre_autor
        }).data;
    }

    async actualizar(id, datos) {
        const autor = new AutoresDTO(datos);
        await this.database.execute(
            `
            UPDATE autores
            SET nombre_autor = ?
            WHERE id_autor = ?
            `,
            [autor.nombre_autor, id]
        );

        return this.buscarPorId(id);
    }

    async eliminar(id) {
        const [result] = await this.database.execute(
            `
            DELETE FROM autores
            WHERE id_autor = ?
            `,
            [id]
        );

        return result.affectedRows > 0;
    }
}

const autores = new Autores();

export default autores;
