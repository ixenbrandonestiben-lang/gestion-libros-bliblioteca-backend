import { Router } from 'express';
import { validationResult } from 'express-validator';

import { pool } from '../config/db.js';
import AutoresDTO from '../dto/autores.dto.js';
import validacionAutores from '../validator/autores.crear.validaciones.js';

const autoresRouter = Router();

autoresRouter.get('/:id_autor', async (req, res, next) => {

    try {

        const [rows] = await pool.execute(
            `
            SELECT *
            FROM autores
            WHERE id_autor = ?
            `,
            [req.params.id_autor]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                status: 'error',
                message: 'Autor no encontrado'
            });
        }

        const autor = new AutoresDTO(rows[0]);

        return res.json(autor.data);

    } catch (error) {

        next(error);
    }
});

autoresRouter.post(
    '/',
    validacionAutores,
    async (req, res, next) => {

        try {

            const errores = validationResult(req);

            if (!errores.isEmpty()) {

                return res.status(400).json({
                    status: 'error',
                    errores: errores.array()
                });
            }

            const autor = new AutoresDTO(req.body);

            const [result] = await pool.execute(
                `
                INSERT INTO autores (
                    nombre_autor
                )
                VALUES (?)
                `,
                [autor.nombre_autor]
            );

            return res.status(201).json({
                status: 'success',
                id: result.insertId,
                message: 'Autor registrado correctamente'
            });

        } catch (error) {

            next(error);
        }
    }
);

export default autoresRouter;