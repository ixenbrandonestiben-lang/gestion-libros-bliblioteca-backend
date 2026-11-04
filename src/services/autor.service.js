import AutorDTO from '../dtos/autor.dto.js';
import AutorModel from '../models/autor.model.js';

export class AutorNoEncontradoError extends Error {
    constructor(id_autor) {
        super(`No se encontró el autor con id ${id_autor}`);
        this.name = 'AutorNoEncontradoError';
        this.status = 404;
    }
}

export class AutorEnUsoError extends Error {
    constructor(causa) {
        super('No se puede eliminar el autor porque tiene libros asociados', {
            cause: causa
        });
        this.name = 'AutorEnUsoError';
        this.status = 409;
    }
}

export default class AutorService {
    #dto;
    #modelo;

    constructor({
        dto = new AutorDTO(),
        modelo = AutorModel
    } = {}) {
        this.#dto = dto;
        this.#modelo = modelo;
    }

    async listar() {
        const autores = await this.#dto.listar();

        return autores.map((autor) => AutorModel.desdeRegistro(autor).datos);
    }

    async buscarPorId(id_autor) {
        const autor = await this.#dto.buscarPorId(id_autor);

        if (!autor) {
            throw new AutorNoEncontradoError(id_autor);
        }

        return AutorModel.desdeRegistro(autor).datos;
    }

    async crear(datos) {
        const autorModelo = AutorModel.desdeEntrada(datos);
        const id_autor = await this.#dto.crear(autorModelo.nombre_autor);

        return this.buscarPorId(id_autor);
    }

    async actualizar(id_autor, datos) {
        const autorModelo = AutorModel.desdeEntrada(datos);
        const actualizado = await this.#dto.actualizar(
            id_autor,
            autorModelo.nombre_autor
        );

        if (!actualizado) {
            const autorExistente = await this.#dto.buscarPorId(id_autor);

            if (!autorExistente) {
                throw new AutorNoEncontradoError(id_autor);
            }
        }

        return this.buscarPorId(id_autor);
    }

    async eliminar(id_autor) {
        try {
            const eliminado = await this.#dto.eliminar(id_autor);

            if (!eliminado) {
                throw new AutorNoEncontradoError(id_autor);
            }
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new AutorEnUsoError(error);
            }

            throw error;
        }
    }
}
