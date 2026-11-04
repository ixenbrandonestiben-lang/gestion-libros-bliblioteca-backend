import bcrypt from 'bcryptjs';

import ClienteDTO from '../dtos/cliente.dto.js';
import ClienteModel from '../models/cliente.model.js';

export class ClienteNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el cliente con id ${id}`);
        this.name = 'ClienteNoEncontradoError';
        this.status = 404;
    }
}

export class ClienteConflictoError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'ClienteConflictoError';
        this.status = 409;
    }
}

export default class ClienteService {
    #modelo;

    constructor({ modelo = ClienteModel } = {}) {
        this.#modelo = modelo;
    }

    async listar() {
        const clientes = await this.#modelo.listar();
        return clientes.map((cliente) => ClienteDTO.desdeRegistro(cliente));
    }

    async buscarPorId(id) {
        const cliente = await this.#modelo.buscarPorId(id);

        if (!cliente) {
            throw new ClienteNoEncontradoError(id);
        }

        return ClienteDTO.desdeRegistro(cliente);
    }

    async crear(datos) {
        const registro = {
            ...datos,
            contrasena: await bcrypt.hash(datos.contrasena, 12)
        };

        try {
            const id = await this.#modelo.crear(registro);
            return this.buscarPorId(id);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ClienteConflictoError(
                    'Ya existe un cliente con ese DPI o correo',
                    { cause: error }
                );
            }

            throw error;
        }
    }

    async actualizar(id, datos) {
        const cambios = { ...datos };

        if (cambios.contrasena !== undefined) {
            cambios.contrasena = await bcrypt.hash(cambios.contrasena, 12);
        }

        try {
            await this.#modelo.actualizar(id, cambios);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ClienteConflictoError(
                    'Ya existe otro cliente con ese DPI o correo',
                    { cause: error }
                );
            }

            throw error;
        }

        return this.buscarPorId(id);
    }

    async eliminar(id) {
        try {
            const eliminado = await this.#modelo.eliminar(id);

            if (!eliminado) {
                throw new ClienteNoEncontradoError(id);
            }
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new ClienteConflictoError(
                    'No se puede eliminar el cliente porque tiene ventas o préstamos asociados',
                    { cause: error }
                );
            }

            throw error;
        }
    }
}

const clienteService = new ClienteService();

export { clienteService };
