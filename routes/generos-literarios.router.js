import { Router } from 'express';
import { validationResult } from 'express-validator';

import { pool } from '../config/db.js';
import GenerosLiterariosDTO from '../dto/generos-literarios.dtos.js';
import validacionGenerosLiterarios from '../validator/generos-literarios.crear.validaciones.js';

const GenerosLiterariosRouter = Router();

GenerosLiterariosRouter.get('/:id_genero', async (req, res, next) => {

    try {

        const [rows] = await pool.execute(
            `
            SELECT *
            FROM generos_literarios
            WHERE id_genero = ?
            `,
            [req.params.id_genero]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                status: 'error',
                message: 'genero no encontrado'
            });
        }

        const genero = new GenerosLiterariosDTO(rows[0]);

        return res.json(genero.data);

    } catch (error) {

        next(error);
    }
});

GenerosLiterariosRouter.post(
    '/',
    validacionGenerosLiterarios,
    async (req, res, next) => {

        try {

            const errores = validationResult(req.body);

            if (!errores.isEmpty()) {

                return res.status(400).json({
                    status: 'error',
                    errores: errores.array()
                });
            }

            const genero = new GenerosLiterariosDTO(req.body);

            const [result] = await pool.execute(
                `
                INSERT INTO generos_literarios (
                    nombre_genero
                )
                VALUES (?)
                `,
                [genero.nombre_genero]
            );

            return res.status(201).json({
                status: 'success',
                id: result.insertId,
                message: 'Genero registrado correctamente'
            });

        } catch (error) {

            next(error);
        }
    }
);


GenerosLiterariosRouter.put('/:id', async (req, res, next)=> {
    try {
        const { id }= req.params;
        const { nombre_genero } = req.body;
        console.log(nombre_genero)

        const [ result ] = await pool.execute(
            `UPDATE generos_literarios
            SET nombre_genero = IFNULL(?, nombre_genero) WHERE id_genero = ?`, [nombre_genero || null, id]);
            
            if( result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: "genero no encontrado"
                });
            }

            res.json({ 
                status: "exitoso",
                message: "genero actualizado con exitos"
            })
    } catch (error) {
        next(error);
    }
});

GenerosLiterariosRouter.delete('/:id', async (req, res, next)=>{
    try {
        const { id } = req.params;
        const [ result ] = await pool.execute(`
            DELETE FROM generos_literarios 
            WHERE id_genero = ?`,
             [id]
            );

            if(result.affectedRows === 0){
                return res.status(404).json({
                    status: "error",
                    message: `No existe ningun genero registrado con el id: ${id}`
                });
            }

            res.json({
                status: "exitoso",
                message: "genero eliminado exitosamente"
            });
    } catch (error) {
        next(error);
    }
});

export default GenerosLiterariosRouter;