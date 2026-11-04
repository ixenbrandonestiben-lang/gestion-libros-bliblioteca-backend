import LibroDTO from '../dtos/libro.dto.js';
import LibroModel from '../models/libro.model.js';

export class LibroNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el libro con id ${id}`);
        this.name = 'LibroNoEncontradoError';
        this.status = 404;
    }
}

export class LibroConflictoError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'LibroConflictoError';
        this.status = 409;
    }
}

export class ReferenciaLibroNoEncontradaError extends Error {
    constructor(causa) {
        super('El autor, editorial o género indicado no existe', { cause: causa });
        this.name = 'ReferenciaLibroNoEncontradaError';
        this.status = 422;
    }
}

export default class LibroService {
    #modelo;

    constructor({ modelo = LibroModel } = {}) {
        this.#modelo = modelo;
    }

    async listar() {
        const libros = await this.#modelo.listar();
        return libros.map((libro) => LibroDTO.desdeRegistro(libro));
    }

    async buscarPorId(id) {
        const libro = await this.#modelo.buscarPorId(id);

        if (!libro) {
            throw new LibroNoEncontradoError(id);
        }

        return LibroDTO.desdeRegistro(libro);
    }

    async crear(datos) {
        try {
            const id = await this.#modelo.crear(datos);
            return await this.buscarPorId(id);
        } catch (error) {
            this.#convertirErrorDeBaseDeDatos(error);
            throw error;
        }
    }

    async actualizar(id, datos) {
        try {
            await this.#modelo.actualizar(id, datos);
            return await this.buscarPorId(id);
        } catch (error) {
            this.#convertirErrorDeBaseDeDatos(error);
            throw error;
        }
    }

    async eliminar(id) {
        try {
            const eliminado = await this.#modelo.eliminar(id);

            if (!eliminado) {
                throw new LibroNoEncontradoError(id);
            }
        } catch (error) {
            if (this.#esClaveForanea(error)) {
                throw new LibroConflictoError(
                    'No se puede eliminar el libro porque tiene ventas o préstamos asociados',
                    { cause: error }
                );
            }

            throw error;
        }
    }

    #convertirErrorDeBaseDeDatos(error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new LibroConflictoError('Ya existe un libro con ese ISBN', {
                cause: error
            });
        }

        if (this.#esClaveForanea(error)) {
            throw new ReferenciaLibroNoEncontradaError(error);
        }
    }

    #esClaveForanea(error) {
        return error.code === 'ER_ROW_IS_REFERENCED_2'
            || error.code === 'ER_ROW_IS_REFERENCED'
            || error.code === 'ER_NO_REFERENCED_ROW_2'
            || error.code === 'ER_NO_REFERENCED_ROW';
    }
}

const libroService = new LibroService();

export { libroService };