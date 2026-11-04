import { Router } from 'express';

import authController from '../controllers/auth.controller.js';
import authLimiter from '../config/limiter.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validatorMiddleware from '../middlewares/validator.middleware.js';
import {
    validarInicioSesion,
    validarRegistro
} from '../validators/auth.validator.js';

const authRouter = Router();

authRouter.get('/', (req, res) => res.status(200).json({
    status: 'success',
    endpoints: {
        registro: 'POST /api/v1/auth/register',
        iniciarSesion: 'POST /api/v1/auth/login',
        perfil: 'GET /api/v1/auth/me',
        cerrarSesion: 'POST /api/v1/auth/logout'
    }
}));

authRouter.post(
    '/register',
    authLimiter,
    validarRegistro,
    validatorMiddleware,
    authController.registrar
);
authRouter.post(
    '/login',
    authLimiter,
    validarInicioSesion,
    validatorMiddleware,
    authController.iniciarSesion
);
authRouter.get('/me', autenticar, authController.perfil);
authRouter.post('/logout', autenticar, authController.cerrarSesion);

export default authRouter;