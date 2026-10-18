import express from 'express';

import autoresRouter from './routes/autores.router.js';
import editorialesRouter from './routes/editoriales.router.js';
import GenerosLiterariosRouter from './routes/generos-literarios.router.js'


import {
    conexionBaseDeDatos
} from './config/db.js';

const app = express();

const PORT = process.env.SERVER_PORT;
const nombreBaseDatos = process.env.DB_NAME;

app.use(express.json());

app.use('/api/autores', autoresRouter);
app.use('/api/editoriales', editorialesRouter);
app.use('/api/generos', GenerosLiterariosRouter);


app.get('/api/estado', async (req, res, next) => {

    try {

        const estadoConexion =
            await conexionBaseDeDatos();

        if (estadoConexion) {

            return res.status(200).json({
                status: 'success',
                message:
                    `Conexión exitosa con ${nombreBaseDatos}`
            });
        }

        return res.status(500).json({
            status: 'error',
            message:
                'No fue posible conectar con la base de datos'
        });

    } catch (error) {

        next(error);
    }
});

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(500).json({
        status: 'error',
        message: err.message
    });
});

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});