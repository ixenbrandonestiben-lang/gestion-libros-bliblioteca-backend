import { Router } from 'express';

const authRouter = Router();

authRouter.get('/', (req, res) => res.status(501).json({
    status: 'error',
    message: 'El módulo de autenticación todavía no tiene endpoints implementados.'
}));

export default authRouter;