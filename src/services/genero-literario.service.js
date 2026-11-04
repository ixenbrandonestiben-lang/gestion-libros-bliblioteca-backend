import GeneroLiterarioDTO from '../dtos/genero-literario.dto.js';
import GeneroLiterarioModel from '../models/genero-literario.model.js';

export class GeneroLiterarioNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el género literario con id ${id}`);
        this.name = 'GeneroLiterarioNoEncontradoError';
        this.status = 404;
    }
}

export class GeneroLiterarioEnUsoError extends Error {
    constructor(causa) {
        super('No se puede eliminar el género literario porque tiene libros asociados', {
            cause: causa
        });
        this.name = 'GeneroLiterarioEnUsoError';
        this.status = 409;
    }
}

export default class GeneroLiterarioService {
    #modelo;

    constructor({ modelo = GeneroLiterarioModel } = {}) {
        this.#modelo = modelo;
    }

    async listar() {
        const generos = await this.#modelo.listar();
        return generos.map((genero) => GeneroLiterarioDTO.desdeRegistro(genero));
    }

    async buscarPorId(id) {
        const genero = await this.#modelo.buscarPorId(id);

        if (!genero) {
            throw new GeneroLiterarioNoEncontradoError(id);
        }

        return GeneroLiterarioDTO.desdeRegistro(genero);
    }

    async crear(datos) {
        const id = await this.#modelo.crear(datos.nombre_genero);
        return this.buscarPorId(id);
    }

    async actualizar(id, datos) {
        await this.#modelo.actualizar(id, datos.nombre_genero);
        return this.buscarPorId(id);
    }

    async eliminar(id) {
        try {
            const eliminado = await this.#modelo.eliminar(id);

            if (!eliminado) {
                throw new GeneroLiterarioNoEncontradoError(id);
            }
        } catch (error) {
            if (
                error.code === 'ER_ROW_IS_REFERENCED_2'
                || error.code === 'ER_ROW_IS_REFERENCED'
            ) {
                throw new GeneroLiterarioEnUsoError(error);
            }

            throw error;
        }
    }
}

const generoLiterarioService = new GeneroLiterarioService();

export { generoLiterarioService };
