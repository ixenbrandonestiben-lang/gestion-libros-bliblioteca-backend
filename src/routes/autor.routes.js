import { Router } from 'express';

import autorController from '../controllers/autor.controller.js';
import {
    autenticar,
    esPersonal
} from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    actualizarAutorRules,
    crearAutorRules,
    idAutorRules
} from '../validators/autor.validator.js';

const autorRouter = Router();

autorRouter.get('/', autorController.listar);
autorRouter.get(
    '/:id',
    idAutorRules,
    validatorMiddleware,
    autorController.buscarPorId
);
autorRouter.post(
    '/',
    autenticar,
    esPersonal,
    crearAutorRules,
    validatorMiddleware,
    autorController.crear
);
autorRouter.put(
    '/:id',
    autenticar,
    esPersonal,
    [...idAutorRules, ...actualizarAutorRules],
    validatorMiddleware,
    autorController.actualizar
);
autorRouter.patch(
    '/:id',
    autenticar,
    esPersonal,
    [...idAutorRules, ...actualizarAutorRules],
    validatorMiddleware,
    autorController.actualizar
);
autorRouter.delete(
    '/:id',
    autenticar,
    esPersonal,
    idAutorRules,
    validatorMiddleware,
    autorController.eliminar
);

export default autorRouter;
