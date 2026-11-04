import 'dotenv/config';

import app from './app.js';
import { validarConfiguracion } from './config/environment.js';
import pool from './config/db.js';

const port = process.env.PORT || process.env.SERVER_PORT || 3000;

const iniciarServidor = async () => {
    validarConfiguracion();
    await pool.query('SELECT 1');

    app.listen(port, () => {
        console.log(`Servidor ejecutándose en http://localhost:${port}`);
    });
};

iniciarServidor().catch((error) => {
    console.error('No se pudo iniciar el servidor:', error);
    process.exitCode = 1;
});
