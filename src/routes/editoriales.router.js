import { Router } from 'express';
import { validationResult } from 'express-validator';

import { pool } from '../config/db.js';
import editorialesDTO from '../dto/editoriales.dto.js';
import validacionEditoriales from '../validator/editoriales.crea.validaciones.js';

const editorialesRouter = Router();

editorialesRouter.get('/:id_editorial', async (req, res, next) => {

    try {

        const [rows] = await pool.execute(
            `
            SELECT *
            FROM editoriales
            WHERE id_editorial = ?
            `,
            [req.params.id_editorial]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                status: 'error',
                message: 'Editorial no encontrado'
            });
        }

        const editorial = new editorialesDTO(rows[0]);

        return res.json(editorial.data);

    } catch (error) {

        next(error);
    }
});

editorialesRouter.post(
    '/',
    validacionEditoriales,
    async (req, res, next) => {

        try {

            const errores = validationResult(req);

            if (!errores.isEmpty()) {

                return res.status(400).json({
                    status: 'error',
                    errores: errores.array()
                });
            }

            const editorial = new editorialesDTO(req.body);

            const [result] = await pool.execute(
                `
                INSERT INTO editoriales (
                    nombre_editorial
                )
                VALUES (?)
                `,
                [editorial.nombre_editorial]
            );

            return res.status(201).json({
                status: 'success',
                id: result.insertId,
                message: 'Editorial registrado correctamente'
            });

        } catch (error) {

            next(error);
        }
    }
);

editorialesRouter.put('/:id', async (req, res, next)=> {
    try {
        const { id }= req.params;
        const { nombre_editorial} = req.body;
        console.log(nombre_editorial)

        const [ result ] = await pool.execute(
            `UPDATE editoriales
            SET nombre_editorial = IFNULL(?, nombre_editorial) WHERE id_editorial = ?`, [nombre_editorial || null, id]);
            
            if( result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: "editorila no encontrada"
                });
            }

            res.json({ 
                status: "exitoso",
                message: "Editorial actualizado con exitos"
            })
    } catch (error) {
        next(error);
    }
});

editorialesRouter.delete('/:id', async (req, res, next)=>{
    try {
        const { id } = req.params;
        const [ result ] = await pool.execute(`
            DELETE FROM editoriales 
            WHERE id_editorial = ?`,
             [id]
            );

            if(result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: `No existe ninguna editorial con el id: ${id}`
                });
            }

            res.json({
                status: "exitoso",
                message: "Editorial eliminada exitosamente"
            });
    } catch (error) {
        next(error);
    }
});

export default editorialesRouter;