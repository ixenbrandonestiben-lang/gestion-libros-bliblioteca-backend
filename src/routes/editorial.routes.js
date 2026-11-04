import { Router } from 'express';

import editorialController from '../controllers/editorial.controller.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    actualizarEditorialRules,
    crearEditorialRules,
    idEditorialRules
} from '../validators/editorial.validator.js';

const editorialRouter = Router();

editorialRouter.get('/', editorialController.listar);
editorialRouter.get(
    '/:id',
    idEditorialRules,
    validatorMiddleware,
    editorialController.buscarPorId
);
editorialRouter.post(
    '/',
    crearEditorialRules,
    validatorMiddleware,
    editorialController.crear
);
editorialRouter.put(
    '/:id',
    [...idEditorialRules, ...actualizarEditorialRules],
    validatorMiddleware,
    editorialController.actualizar
);
editorialRouter.patch(
    '/:id',
    [...idEditorialRules, ...actualizarEditorialRules],
    validatorMiddleware,
    editorialController.actualizar
);
editorialRouter.delete(
    '/:id',
    idEditorialRules,
    validatorMiddleware,
    editorialController.eliminar
);

export default editorialRouter;
