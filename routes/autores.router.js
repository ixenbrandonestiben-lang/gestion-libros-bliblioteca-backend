import { Router } from "express";
import { validationResult } from "express-validator";

import pool from '../config/db.js';
import autoresDTO from "../dto/autores.dto.js";
import validacionAtuores from '../validator/autores.crear.validaciones.js';

const autoresRouter =  Router();

autoresRouter.get('/:id', async (req, res, next)=>{
    try {
        const [ rows ] = await pool.execute(
            `SELECT 
                * FROM autores 
            WHERE id = ?`,
         [ req,params.id ]);

         if(rows.length === 0){
            return res.status(404).json({
                status: "error",
                message: "Autor no encontrado"
            });
         }
         const usuario = new autoresDTO(rows[0]);
         res,json(usuario.data);
    }
    catch (error) {
        next(error);
    }
});

autoresRouter.post('/crearautores', validacionAtuores, async(req, res, next)=>{
    try {
        const autor = new autoresDTO(req.body);
        const [ result ] = await pool.execute(
            `INSERT INTO autores( nombre_autor ) VALUES (?)`,[ autor.nombre_autor]
        );
        res.status(201).json({
            id: result.insertID,
            message: 'Autor registrado con éxito ... '
        });
    } catch (error) {
        next(error);
    }
});