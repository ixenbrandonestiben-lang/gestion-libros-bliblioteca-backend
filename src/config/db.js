import 'dotenv/config';
import { createPool } from 'mysql2/promise';

export class Database {
    #pool;

    constructor({ env = process.env, poolFactory = createPool } = {}) {
        const configuracion = this.#obtenerConfiguracion(env);

        this.#pool = poolFactory(configuracion);
    }

    #obtenerConfiguracion(env) {
        const requeridas = ['DB_HOST', 'DB_USER', 'DB_NAME'];
        const faltantes = requeridas.filter(
            (variable) => !env[variable]?.trim()
        );

        if (faltantes.length > 0) {
            throw new Error(
                `Faltan variables de configuración de base de datos: ${faltantes.join(', ')}`
            );
        }

        const puerto = Number(env.DB_PORT || 3306);

        if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
            throw new Error('DB_PORT debe ser un puerto entero entre 1 y 65535');
        }

        return {
            host: env.DB_HOST.trim(),
            user: env.DB_USER.trim(),
            password: env.DB_PASSWORD ?? '',
            database: env.DB_NAME.trim(),
            port: puerto,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true
        };
    }

    async execute(consulta, parametros = []) {
        return this.#pool.execute(consulta, parametros);
    }

    async getConnection() {
        return this.#pool.getConnection();
    }

    async cerrar() {
        await this.#pool.end();
    }
}

const database = new Database();

export default database;
