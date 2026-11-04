import { Router } from 'express';

import clienteController from '../controllers/cliente.controller.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    crearClienteRules,
    actualizarClienteRules,
    idClienteRules
} from '../validators/cliente.validator.js';

const clienteRouter = Router();

clienteRouter.get('/', clienteController.listar);
clienteRouter.get(
    '/:id',
    idClienteRules,
    validatorMiddleware,
    clienteController.buscarPorId
);
clienteRouter.post(
    '/',
    crearClienteRules,
    validatorMiddleware,
    clienteController.crear
);
clienteRouter.put(
    '/:id',
    [...idClienteRules, ...actualizarClienteRules],
    validatorMiddleware,
    clienteController.actualizar
);
clienteRouter.patch(
    '/:id',
    [...idClienteRules, ...actualizarClienteRules],
    validatorMiddleware,
    clienteController.actualizar
);
clienteRouter.delete(
    '/:id',
    idClienteRules,
    validatorMiddleware,
    clienteController.eliminar
);

export default clienteRouter;
