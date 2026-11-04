import { Router } from 'express';

import generoLiterarioController from '../controllers/genero-literario.controller.js';
import { autenticar, esPersonal } from '../middlewares/auth.middleware.js';
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
    autenticar,
    esPersonal,
    crearGeneroRules,
    validatorMiddleware,
    generoLiterarioController.crear
);
generoLiterarioRouter.put(
    '/:id',
    autenticar,
    esPersonal,
    [...idGeneroRules, ...actualizarGeneroRules],
    validatorMiddleware,
    generoLiterarioController.actualizar
);
generoLiterarioRouter.patch(
    '/:id',
    autenticar,
    esPersonal,
    [...idGeneroRules, ...actualizarGeneroRules],
    validatorMiddleware,
    generoLiterarioController.actualizar
);
generoLiterarioRouter.delete(
    '/:id',
    autenticar,
    esPersonal,
    idGeneroRules,
    validatorMiddleware,
    generoLiterarioController.eliminar
);

export default generoLiterarioRouter;
