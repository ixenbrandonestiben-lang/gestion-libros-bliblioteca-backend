import { Router } from 'express';

import editorialController from '../controllers/editorial.controller.js';
import { autenticar, esPersonal } from '../middlewares/auth.middleware.js';
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
    autenticar,
    esPersonal,
    crearEditorialRules,
    validatorMiddleware,
    editorialController.crear
);
editorialRouter.put(
    '/:id',
    autenticar,
    esPersonal,
    [...idEditorialRules, ...actualizarEditorialRules],
    validatorMiddleware,
    editorialController.actualizar
);
editorialRouter.patch(
    '/:id',
    autenticar,
    esPersonal,
    [...idEditorialRules, ...actualizarEditorialRules],
    validatorMiddleware,
    editorialController.actualizar
);
editorialRouter.delete(
    '/:id',
    autenticar,
    esPersonal,
    idEditorialRules,
    validatorMiddleware,
    editorialController.eliminar
);

export default editorialRouter;
