import 'dotenv/config';

export const validarConfiguracion = () => {
    const requeridas = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const faltantes = requeridas.filter((variable) => !process.env[variable]);

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        faltantes.push('JWT_SECRET (mínimo 32 caracteres)');
    }

    const puertoBD = Number(process.env.DB_PORT || 3306);
    if (!Number.isInteger(puertoBD) || puertoBD < 1 || puertoBD > 65535) {
        faltantes.push('DB_PORT (entero entre 1 y 65535)');
    }

    const puertoServidor = Number(
        process.env.PORT || process.env.SERVER_PORT || 3000
    );
    if (
        !Number.isInteger(puertoServidor)
        || puertoServidor < 1
        || puertoServidor > 65535
    ) {
        faltantes.push('PORT (entero entre 1 y 65535)');
    }

    if (faltantes.length > 0) {
        throw new Error(
            `Configuración inválida o incompleta: ${faltantes.join(', ')}`
        );
    }
};
