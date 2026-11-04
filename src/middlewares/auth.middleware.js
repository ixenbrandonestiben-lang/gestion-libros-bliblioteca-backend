import jwt from 'jsonwebtoken';

import {
    JWT_AUDIENCE,
    JWT_ISSUER,
    obtenerJwtSecret
} from '../config/auth.js';
import { ROLES_PERSONAL } from '../constants/index.js';
import authService from '../services/auth.service.js';

const noAutorizado = (res, message = 'Se requiere un token Bearer válido') => (
    res.status(401).json({
        status: 'error',
        message
    })
);

export const autenticar = async (req, res, next) => {
    const authorization = req.get('authorization');
    const coincidencia = authorization?.match(/^Bearer\s+(.+)$/i);

    if (!coincidencia) {
        return noAutorizado(res);
    }

    const jwtSecret = obtenerJwtSecret();

    let payload;

    try {
        payload = jwt.verify(coincidencia[1], jwtSecret, {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return noAutorizado(res, 'El token expiró; inicia sesión nuevamente');
        }

        if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
            return noAutorizado(res, 'El token no es válido');
        }

        throw error;
    }

    if (!payload || typeof payload !== 'object' || !/^[1-9]\d*$/.test(payload.sub)) {
        return noAutorizado(res, 'El token no es válido');
    }

    req.user = await authService.buscarPerfil(Number(payload.sub));
    return next();
};

export const autorizarRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({
            status: 'error',
            message: 'No tienes permisos para realizar esta operación'
        });
    }

    return next();
};

export const esPersonal = autorizarRoles(...ROLES_PERSONAL);