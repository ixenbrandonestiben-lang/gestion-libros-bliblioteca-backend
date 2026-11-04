import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import AuthDTO from '../dtos/auth.dto.js';
import AuthModel from '../models/auth.model.js';

const ISSUER = 'biblioteca-villa-api';
const AUDIENCE = 'biblioteca-villa-frontend';
const TOKEN_EXPIRATION = '8h';

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

const obtenerSecreto = () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        const error = new Error('JWT_SECRET debe configurarse con al menos 32 caracteres');
        error.status = 500;
        throw error;
    }

    return process.env.JWT_SECRET;
};

export class AuthService {
    #modelo;

    constructor({ modelo = AuthModel } = {}) {
        this.#modelo = modelo;
    }

    async registrar(datos) {
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
            obtenerSecreto(),
            {
                subject: String(usuario.id_cliente),
                issuer: ISSUER,
                audience: AUDIENCE,
                expiresIn: TOKEN_EXPIRATION
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