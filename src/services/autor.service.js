import AutorModel from '../models/autor.model.js';

export class AutorNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el autor con id ${id}`);
        this.name = 'AutorNoEncontradoError';
        this.status = 404;
    }
}

export class AutorEnUsoError extends Error {
    constructor() {
        super('No se puede eliminar el autor porque tiene libros asociados');
        this.name = 'AutorEnUsoError';
        this.status = 409;
    }
}

export class AutorService {
    #modelo;

    constructor({ modelo = AutorModel } = {}) {
        this.#modelo = modelo;
    }

    listar() {
        return this.#modelo.listar();
    }

    async buscarPorId(id) {
        const autor = await this.#modelo.buscarPorId(id);
        if (!autor) {
            throw new AutorNoEncontradoError(id);
        }

        return autor;
    }

    async crear(datos) {
        const id = await this.#modelo.crear(datos.nombre_autor);
        return this.buscarPorId(id);
    }

    async actualizar(id, datos) {
        await this.#modelo.actualizar(id, datos.nombre_autor);
        return this.buscarPorId(id);
    }

    async eliminar(id) {
        try {
            const eliminado = await this.#modelo.eliminar(id);
            if (!eliminado) {
                throw new AutorNoEncontradoError(id);
            }
        } catch (error) {
            if (
                error.code === 'ER_ROW_IS_REFERENCED_2'
                || error.code === 'ER_ROW_IS_REFERENCED'
            ) {
                throw new AutorEnUsoError();
            }

            throw error;
        }
    }
}

const autorService = new AutorService();

export default autorService;
export { autorService };
