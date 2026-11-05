import { Router } from 'express';

import clienteController from '../controllers/cliente.controller.js';
import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    crearClienteRules,
    actualizarClienteRules,
    idClienteRules
} from '../validators/cliente.validator.js';

const clienteRouter = Router();
const soloAdmin = [autenticar, autorizarRoles(ROLES.ADMIN)];

clienteRouter.get('/', ...soloAdmin, clienteController.listar);
clienteRouter.get(
    '/:id',
    ...soloAdmin,
    idClienteRules,
    validatorMiddleware,
    clienteController.buscarPorId
);
clienteRouter.post(
    '/',
    ...soloAdmin,
    crearClienteRules,
    validatorMiddleware,
    clienteController.crear
);
clienteRouter.put(
    '/:id',
    ...soloAdmin,
    [...idClienteRules, ...actualizarClienteRules],
    validatorMiddleware,
    clienteController.actualizar
);
clienteRouter.patch(
    '/:id',
    ...soloAdmin,
    [...idClienteRules, ...actualizarClienteRules],
    validatorMiddleware,
    clienteController.actualizar
);
clienteRouter.delete(
    '/:id',
    ...soloAdmin,
    idClienteRules,
    validatorMiddleware,
    clienteController.eliminar
);

export default clienteRouter;
