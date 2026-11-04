import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.'
    }
});

export default authLimiter;