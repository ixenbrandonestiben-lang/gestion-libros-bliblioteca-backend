import { Router } from 'express';

import ventaController from '../controllers/venta.controller.js';
import {
    autenticar,
    esPersonal
} from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    crearVentaRules,
    idVentaRules,
    listarVentasRules
} from '../validators/venta.validator.js';

const ventaRouter = Router();

ventaRouter.get(
    '/',
    autenticar,
    esPersonal,
    listarVentasRules,
    validatorMiddleware,
    ventaController.listar
);
ventaRouter.get(
    '/:id',
    autenticar,
    esPersonal,
    idVentaRules,
    validatorMiddleware,
    ventaController.buscarPorId
);
ventaRouter.post(
    '/',
    autenticar,
    esPersonal,
    crearVentaRules,
    validatorMiddleware,
    ventaController.crear
);

export default ventaRouter;