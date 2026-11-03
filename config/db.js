import { createPool } from 'mysql2/promise';
import 'dotenv/config';

export const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function conexionBaseDeDatos() {
    try {

        const conexion = await pool.getConnection();

        console.log('Base de datos conectada correctamente.');

        conexion.release();

        return true;

    } catch (error) {

        console.error('Error de conexión:', error.message);

        return false;
    }
}