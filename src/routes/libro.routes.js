import { Router } from 'express';

import libroController from '../controllers/libro.controller.js';
import { autenticar, esPersonal } from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    actualizarLibroRules,
    crearLibroRules,
    idLibroRules,
    reemplazarLibroRules
} from '../validators/libro.validator.js';

const libroRouter = Router();

libroRouter.get('/', libroController.listar);
libroRouter.get(
    '/:id',
    idLibroRules,
    validatorMiddleware,
    libroController.buscarPorId
);
libroRouter.post(
    '/',
    autenticar,
    esPersonal,
    crearLibroRules,
    validatorMiddleware,
    libroController.crear
);
libroRouter.put(
    '/:id',
    autenticar,
    esPersonal,
    [...idLibroRules, ...reemplazarLibroRules],
    validatorMiddleware,
    libroController.actualizar
);
libroRouter.patch(
    '/:id',
    autenticar,
    esPersonal,
    [...idLibroRules, ...actualizarLibroRules],
    validatorMiddleware,
    libroController.actualizar
);
libroRouter.delete(
    '/:id',
    autenticar,
    esPersonal,
    idLibroRules,
    validatorMiddleware,
    libroController.eliminar
);

export default libroRouter;