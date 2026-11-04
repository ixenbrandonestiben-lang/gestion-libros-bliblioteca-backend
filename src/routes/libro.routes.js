import { Router } from 'express';

import libroController from '../controllers/libro.controller.js';
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
    crearLibroRules,
    validatorMiddleware,
    libroController.crear
);
libroRouter.put(
    '/:id',
    [...idLibroRules, ...reemplazarLibroRules],
    validatorMiddleware,
    libroController.actualizar
);
libroRouter.patch(
    '/:id',
    [...idLibroRules, ...actualizarLibroRules],
    validatorMiddleware,
    libroController.actualizar
);
libroRouter.delete(
    '/:id',
    idLibroRules,
    validatorMiddleware,
    libroController.eliminar
);

export default libroRouter;