export const JWT_ISSUER = 'biblioteca-villa-api';
export const JWT_AUDIENCE = 'biblioteca-villa-frontend';
export const JWT_EXPIRATION_SECONDS = 8 * 60 * 60;

export const obtenerJwtSecret = () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        const error = new Error(
            'JWT_SECRET debe configurarse con al menos 32 caracteres'
        );
        error.status = 500;
        throw error;
    }

    return process.env.JWT_SECRET;
};
