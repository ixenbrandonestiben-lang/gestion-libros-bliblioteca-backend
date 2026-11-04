import { Router } from 'express';

import authRouter from './auth.routes.js';
import clienteRouter from './cliente.routes.js';
import editorialRouter from './editorial.routes.js';
import generoLiterarioRouter from './genero-literario.routes.js';
import libroRouter from './libro.routes.js';
import prestamoRouter from './prestamo.routes.js';
import ventaRouter from './venta.routes.js';

const routes = Router();

routes.get('/', (req, res) => res.status(200).json({
    status: 'success',
    name: 'Biblioteca Villa API',
    version: 'v1',
    endpoints: {
        auth: '/api/v1/auth',
        clientes: '/api/v1/clientes',
        editoriales: '/api/v1/editoriales',
        generosLiterarios: '/api/v1/generos-literarios',
        libros: '/api/v1/libros',
        prestamos: '/api/v1/prestamos',
        ventas: '/api/v1/ventas'
    }
}));

routes.use('/auth', authRouter);
routes.use('/clientes', clienteRouter);
routes.use('/editoriales', editorialRouter);
routes.use('/generos-literarios', generoLiterarioRouter);
routes.use('/libros', libroRouter);
routes.use('/prestamos', prestamoRouter);
routes.use('/ventas', ventaRouter);

export default routes;
