import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
    JWT_AUDIENCE,
    JWT_EXPIRATION_SECONDS,
    JWT_ISSUER,
    obtenerJwtSecret
} from '../config/auth.js';
import AuthDTO from '../dtos/auth.dto.js';
import AuthModel from '../models/auth.model.js';

export class CredencialesInvalidasError extends Error {
    constructor() {
        super('Correo o contraseña incorrectos');
        this.name = 'CredencialesInvalidasError';
        this.status = 401;
    }
}

export class CuentaInactivaError extends Error {
    constructor() {
        super('La cuenta no está activa');
        this.name = 'CuentaInactivaError';
        this.status = 403;
    }
}

export class CorreoRegistradoError extends Error {
    constructor() {
        super('Ya existe una cuenta con ese correo o DPI');
        this.name = 'CorreoRegistradoError';
        this.status = 409;
    }
}

export class AuthService {
    #modelo;

    constructor({ modelo = AuthModel } = {}) {
        this.#modelo = modelo;
    }

    async registrar(datos) {
        obtenerJwtSecret();
        const contrasena = await bcrypt.hash(datos.contrasena, 12);

        try {
            await this.#modelo.crearCliente({
                ...datos,
                contrasena
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new CorreoRegistradoError();
            }

            throw error;
        }

        return this.iniciarSesion(datos.correo, datos.contrasena);
    }

    async iniciarSesion(correo, contrasena) {
        const usuario = await this.#modelo.buscarPorCorreo(correo);

        if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
            throw new CredencialesInvalidasError();
        }

        if (usuario.estado_cuenta !== 'ACTIVO') {
            throw new CuentaInactivaError();
        }

        const token = jwt.sign(
            { rol: usuario.rol },
            obtenerJwtSecret(),
            {
                subject: String(usuario.id_cliente),
                issuer: JWT_ISSUER,
                audience: JWT_AUDIENCE,
                expiresIn: JWT_EXPIRATION_SECONDS
            }
        );

        return AuthDTO.desdeSesion(token, usuario);
    }

    async buscarPerfil(id) {
        const usuario = await this.#modelo.buscarPorId(id);

        if (!usuario) {
            throw new CredencialesInvalidasError();
        }

        if (usuario.estado_cuenta !== 'ACTIVO') {
            throw new CuentaInactivaError();
        }

        return AuthDTO.desdePerfil(usuario);
    }
}

const authService = new AuthService();

export default authService;
export { authService };