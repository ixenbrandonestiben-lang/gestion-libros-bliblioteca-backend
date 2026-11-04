import { validationResult } from 'express-validator';

export default class ValidatorMiddleware {
    validar(req, res, next) {
        const resultado = validationResult(req);

        if (!resultado.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errores: resultado.array()
            });
        }


        return next();
    }
}