import { Router } from 'express';

import empleadoController from '../controllers/empleado.controller.js';
import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/index.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    actualizarEmpleadoRules,
    crearEmpleadoRules,
    idEmpleadoRules
} from '../validators/empleado.validator.js';

const empleadoRouter = Router();
const soloAdmin = [autenticar, autorizarRoles(ROLES.ADMIN)];

empleadoRouter.get('/', ...soloAdmin, empleadoController.listar);
empleadoRouter.get(
    '/:id',
    ...soloAdmin,
    idEmpleadoRules,
    validatorMiddleware,
    empleadoController.buscarPorId
);
empleadoRouter.post(
    '/',
    ...soloAdmin,
    crearEmpleadoRules,
    validatorMiddleware,
    empleadoController.crear
);
empleadoRouter.patch(
    '/:id',
    ...soloAdmin,
    [...idEmpleadoRules, ...actualizarEmpleadoRules],
    validatorMiddleware,
    empleadoController.actualizar
);
empleadoRouter.delete(
    '/:id',
    ...soloAdmin,
    idEmpleadoRules,
    validatorMiddleware,
    empleadoController.eliminar
);

export default empleadoRouter;
