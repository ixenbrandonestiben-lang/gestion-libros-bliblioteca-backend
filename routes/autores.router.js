import { Router } from 'express';
import { validationResult } from 'express-validator';

import autores from '../models/autores.model.js';
import validacionAutores from '../validator/autores.crear.validaciones.js';
import validacionIdAutor from '../validator/autores.id.validaciones.js';

const autoresRouter = Router();

const validarSolicitud = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            errores: errores.array()
        });
    }

    return next();
};

autoresRouter.get('/', async (req, res, next) => {
    try {
        const resultado = await autores.listar();
        return res.json(resultado);
    } catch (error) {
        return next(error);
    }
});

autoresRouter.get(
    '/:id_autor',
    validacionIdAutor,
    validarSolicitud,
    async (req, res, next) => {
        try {
            const autor = await autores.buscarPorId(req.params.id_autor);

            if (!autor) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Autor no encontrado'
                });
            }

            return res.json(autor);
        } catch (error) {
            return next(error);
        }
    }
);

autoresRouter.post(
    '/',
    validacionAutores,
    validarSolicitud,
    async (req, res, next) => {
        try {
            const autor = await autores.crear(req.body);

            return res.status(201).json({
                status: 'success',
                id: autor.id,
                message: 'Autor registrado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }
);

autoresRouter.put(
    '/:id_autor',
    validacionIdAutor,
    validacionAutores,
    validarSolicitud,
    async (req, res, next) => {
        try {
            const autor = await autores.actualizar(
                req.params.id_autor,
                req.body
            );

            if (!autor) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Autor no encontrado'
                });
            }

            return res.json({
                status: 'success',
                data: autor,
                message: 'Autor actualizado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }
);

autoresRouter.delete(
    '/:id_autor',
    validacionIdAutor,
    validarSolicitud,
    async (req, res, next) => {
        try {
            const eliminado = await autores.eliminar(req.params.id_autor);

            if (!eliminado) {
                return res.status(404).json({
                    status: 'error',
                    message: `No existe ningún autor con el id: ${req.params.id_autor}`
                });
            }

            return res.json({
                status: 'success',
                message: 'Autor eliminado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }
);

export default autoresRouter;
