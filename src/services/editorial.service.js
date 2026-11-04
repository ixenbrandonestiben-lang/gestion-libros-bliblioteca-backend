import EditorialDTO from '../dtos/editorial.dto.js';
import EditorialModel from '../models/editorial.model.js';

export class EditorialNoEncontradaError extends Error {
    constructor(id) {
        super(`No se encontró la editorial con id ${id}`);
        this.name = 'EditorialNoEncontradaError';
        this.status = 404;
    }
}

export class EditorialEnUsoError extends Error {
    constructor(causa) {
        super('No se puede eliminar la editorial porque tiene libros asociados', {
            cause: causa
        });
        this.name = 'EditorialEnUsoError';
        this.status = 409;
    }
}

export default class EditorialService {
    #modelo;

    constructor({ modelo = EditorialModel } = {}) {
        this.#modelo = modelo;
    }

    async listar() {
        const editoriales = await this.#modelo.listar();
        return editoriales.map((editorial) => EditorialDTO.desdeRegistro(editorial));
    }

    async buscarPorId(id) {
        const editorial = await this.#modelo.buscarPorId(id);

        if (!editorial) {
            throw new EditorialNoEncontradaError(id);
        }

        return EditorialDTO.desdeRegistro(editorial);
    }

    async crear(datos) {
        const id = await this.#modelo.crear(datos.nombre_editorial);
        return this.buscarPorId(id);
    }

    async actualizar(id, datos) {
        await this.#modelo.actualizar(id, datos.nombre_editorial);
        return this.buscarPorId(id);
    }

    async eliminar(id) {
        try {
            const eliminado = await this.#modelo.eliminar(id);

            if (!eliminado) {
                throw new EditorialNoEncontradaError(id);
            }
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new EditorialEnUsoError(error);
            }

            throw error;
        }
    }
}

const editorialService = new EditorialService();

export { editorialService };
