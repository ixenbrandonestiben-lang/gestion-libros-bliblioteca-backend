import { Router } from 'express';

import prestamoController from '../controllers/prestamo.controller.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import { crearPrestamoRules } from '../validators/prestamo.validator.js';

const prestamoRouter = Router();

prestamoRouter.post(
    '/',
    crearPrestamoRules,
    validatorMiddleware,
    prestamoController.crear
);

export default prestamoRouter;