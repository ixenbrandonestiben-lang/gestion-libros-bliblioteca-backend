import { validationResult } from 'express-validator';

const validatorMiddleware = (req, res, next) => {
    const errores = validationResult(req);

    if (errores.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        status: 'error',
        message: 'La solicitud contiene datos inválidos',
        errors: errores.array().map(({ location, path, msg }) => ({
            location,
            field: path,
            message: msg
        }))
    });
};

export default validatorMiddleware;