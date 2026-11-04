import bcrypt from 'bcryptjs';

import EmpleadoModel from '../models/empleado.model.js';

export class EmpleadoNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró una cuenta con id ${id}`);
        this.name = 'EmpleadoNoEncontradoError';
        this.status = 404;
    }
}

export class CuentaDuplicadaError extends Error {
    constructor() {
        super('Ya existe una cuenta con ese DPI o correo');
        this.name = 'CuentaDuplicadaError';
        this.status = 409;
    }
}

export class UltimoAdministradorError extends Error {
    constructor() {
        super('No se puede desactivar o degradar al último administrador activo');
        this.name = 'UltimoAdministradorError';
        this.status = 409;
    }
}

export class EmpleadoService {
    #modelo;

    constructor({ modelo = EmpleadoModel } = {}) {
        this.#modelo = modelo;
    }

    listar() {
        return this.#modelo.listar();
    }

    async buscarPorId(id) {
        const empleado = await this.#modelo.buscarEmpleado(id);
        if (!empleado) {
            throw new EmpleadoNoEncontradoError(id);
        }

        return empleado;
    }

    async crear(datos) {
        try {
            const id = await this.#modelo.crear({
                ...datos,
                contrasena: await bcrypt.hash(datos.contrasena, 12)
            });

            return this.buscarPorId(id);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new CuentaDuplicadaError();
            }

            throw error;
        }
    }

    async actualizar(id, datos) {
        const cuentaActual = await this.#modelo.buscarCuenta(id);
        if (!cuentaActual) {
            throw new EmpleadoNoEncontradoError(id);
        }

        const rolesPersonal = ['ADMIN', 'BIBLIOTECARIO'];
        if (
            !rolesPersonal.includes(cuentaActual.rol)
            && !rolesPersonal.includes(datos.rol)
        ) {
            throw new EmpleadoNoEncontradoError(id);
        }

        const cambios = { ...datos };

        if (cambios.contrasena !== undefined) {
            cambios.contrasena = await bcrypt.hash(cambios.contrasena, 12);
        }

        try {
            const resultado = await this.#modelo.actualizar(id, cambios);

            if (resultado.lastAdmin) {
                throw new UltimoAdministradorError();
            }
            if (!resultado.updated) {
                throw new EmpleadoNoEncontradoError(id);
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new CuentaDuplicadaError();
            }

            throw error;
        }

        const cuenta = await this.#modelo.buscarCuenta(id);
        return cuenta;
    }

    async eliminar(id) {
        await this.buscarPorId(id);
        const resultado = await this.#modelo.actualizar(id, {
            estado_cuenta: 'SUSPENDIDO'
        });

        if (resultado.lastAdmin) {
            throw new UltimoAdministradorError();
        }
        if (!resultado.updated) {
            throw new EmpleadoNoEncontradoError(id);
        }

        return this.buscarPorId(id);
    }
}

const empleadoService = new EmpleadoService();

export default empleadoService;
export { empleadoService };
