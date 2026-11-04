import { Router } from 'express';

import prestamoController from '../controllers/prestamo.controller.js';
import {
    autenticar,
    esPersonal
} from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    crearPrestamoRules,
    devolverPrestamoRules,
    idPrestamoRules,
    listarPrestamosRules
} from '../validators/prestamo.validator.js';

const prestamoRouter = Router();

prestamoRouter.get(
    '/',
    autenticar,
    listarPrestamosRules,
    validatorMiddleware,
    prestamoController.listar
);
prestamoRouter.get(
    '/:id',
    autenticar,
    idPrestamoRules,
    validatorMiddleware,
    prestamoController.buscarPorId
);
prestamoRouter.post(
    '/',
    autenticar,
    esPersonal,
    crearPrestamoRules,
    validatorMiddleware,
    prestamoController.crear
);
prestamoRouter.post(
    '/:id/devolucion',
    autenticar,
    esPersonal,
    devolverPrestamoRules,
    validatorMiddleware,
    prestamoController.devolver
);

export default prestamoRouter;