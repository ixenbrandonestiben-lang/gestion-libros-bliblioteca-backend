import { Router } from 'express';

import AutorController from '../controllers/autor.controller.js';
import ValidatorMiddleware from '../middlewares/validator.middleware.js';
import AutorValidator from '../validators/autor.validator.js';

export default class AutorRoutes {
    #router;

    constructor({
        controlador = new AutorController(),
        validador = new ValidatorMiddleware()
    } = {}) {
        this.#router = Router();

        this.#router.get('/', controlador.listar);
        this.#router.get(
            '/:id_autor',
            AutorValidator.id(),
            validador.validar,
            controlador.buscarPorId
        );
        this.#router.post(
            '/',
            AutorValidator.nombre(),
            validador.validar,
            controlador.crear
        );
        this.#router.put(
            '/:id_autor',
            AutorValidator.id(),
            AutorValidator.nombre(),
            validador.validar,
            controlador.actualizar
        );
        this.#router.delete(
            '/:id_autor',
            AutorValidator.id(),
            validador.validar,
            controlador.eliminar
        );
    }

    obtenerRouter() {
        return this.#router;
    }
}
