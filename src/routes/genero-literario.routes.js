import { Router } from 'express';

import generoLiterarioController from '../controllers/genero-literario.controller.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    actualizarGeneroRules,
    crearGeneroRules,
    idGeneroRules
} from '../validators/genero-literario.validator.js';

const generoLiterarioRouter = Router();

generoLiterarioRouter.get('/', generoLiterarioController.listar);
generoLiterarioRouter.get(
    '/:id',
    idGeneroRules,
    validatorMiddleware,
    generoLiterarioController.buscarPorId
);
generoLiterarioRouter.post(
    '/',
    crearGeneroRules,
    validatorMiddleware,
    generoLiterarioController.crear
);
generoLiterarioRouter.put(
    '/:id',
    [...idGeneroRules, ...actualizarGeneroRules],
    validatorMiddleware,
    generoLiterarioController.actualizar
);
generoLiterarioRouter.patch(
    '/:id',
    [...idGeneroRules, ...actualizarGeneroRules],
    validatorMiddleware,
    generoLiterarioController.actualizar
);
generoLiterarioRouter.delete(
    '/:id',
    idGeneroRules,
    validatorMiddleware,
    generoLiterarioController.eliminar
);

export default generoLiterarioRouter;
