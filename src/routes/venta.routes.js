import { Router } from 'express';

import ventaController from '../controllers/venta.controller.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    crearVentaRules,
    idVentaRules,
    listarVentasRules
} from '../validators/venta.validator.js';

const ventaRouter = Router();

ventaRouter.get(
    '/',
    listarVentasRules,
    validatorMiddleware,
    ventaController.listar
);
ventaRouter.get(
    '/:id',
    idVentaRules,
    validatorMiddleware,
    ventaController.buscarPorId
);
ventaRouter.post(
    '/',
    crearVentaRules,
    validatorMiddleware,
    ventaController.crear
);

export default ventaRouter;