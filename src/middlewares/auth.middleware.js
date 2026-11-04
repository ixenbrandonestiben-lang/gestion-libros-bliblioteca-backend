import jwt from 'jsonwebtoken';

import authService from '../services/auth.service.js';

const ISSUER = 'biblioteca-villa-api';
const AUDIENCE = 'biblioteca-villa-frontend';

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

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        const error = new Error('JWT_SECRET debe configurarse con al menos 32 caracteres');
        error.status = 500;
        throw error;
    }

    let payload;

    try {
        payload = jwt.verify(coincidencia[1], process.env.JWT_SECRET, {
            issuer: ISSUER,
            audience: AUDIENCE
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

export const esPersonal = autorizarRoles('ADMIN', 'BIBLIOTECARIO');