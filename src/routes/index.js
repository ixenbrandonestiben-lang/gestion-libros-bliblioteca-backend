import { Router } from 'express';

import authRouter from './auth.routes.js';
import autorRouter from './autor.routes.js';
import clienteRouter from './cliente.routes.js';
import empleadoRouter from './empleado.routes.js';
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
        autores: '/api/v1/autores',
        clientes: '/api/v1/clientes',
        empleados: '/api/v1/empleados',
        editoriales: '/api/v1/editoriales',
        generosLiterarios: '/api/v1/generos-literarios',
        libros: '/api/v1/libros',
        prestamos: '/api/v1/prestamos',
        ventas: '/api/v1/ventas'
    }
}));

routes.use('/auth', authRouter);
routes.use('/autores', autorRouter);
routes.use('/clientes', clienteRouter);
routes.use('/empleados', empleadoRouter);
routes.use('/editoriales', editorialRouter);
routes.use('/generos-literarios', generoLiterarioRouter);
routes.use('/libros', libroRouter);
routes.use('/prestamos', prestamoRouter);
routes.use('/ventas', ventaRouter);

export default routes;
