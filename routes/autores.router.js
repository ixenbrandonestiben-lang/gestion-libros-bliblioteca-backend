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


autoresRouter.put('/:id', async (req, res, next)=> {
    try {
        const { id }= req.params;
        const { nombre_autor } = req.body;
        console.log(nombre_autor)

        const [ result ] = await pool.execute(
            `UPDATE autores
            SET nombre_autor = IFNULL(?, nombre_autor) WHERE id_autor = ?`, [nombre_autor || null, id]);
            
            if( result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: "Autor no encontrado"
                });
            }

            res.json({ 
                status: "exitoso",
                message: "autor actualizado con exitos"
            })
    } catch (error) {
        next(error);
    }
});

autoresRouter.delete('/:id', async (req, res, next)=>{
    try {
        const { id } = req.params;
        const [ result ] = await pool.execute(`
            DELETE FROM autores 
            WHERE id_autor = ?`,
             [id]
            );

            if(result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: `No existe ningun autor registrado con el id: ${id}`
                });
            }

            res.json({
                status: "exitoso",
                message: "Autor eliminado exitosamente"
            });
    } catch (error) {
        next(error);
    }
});

export default autoresRouter;