import { createPool } from 'mysql2/promise';
import 'dotenv/config';

export const pool = createPool( {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function conexionBaseDeDatos() {
    try {
        const coneccion = await pool.getConnection();
        console.log('La base de datos has sido conectada exitosamente. ');
    } catch (error) {
        console.error('Error al conectar la base de datos:', error.message);
        throw error;
    }
}