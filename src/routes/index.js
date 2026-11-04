import { Router } from 'express';

import AutorRoutes from './autor.routes.js';
import authRouter from './auth.routes.js';
import libroRouter from './libro.routes.js';
import prestamoRouter from './prestamo.routes.js';
import ventaRouter from './venta.routes.js';

const routes = Router();

routes.use('/autores', new AutorRoutes().obtenerRouter());
routes.use('/auth', authRouter);
routes.use('/libros', libroRouter);
routes.use('/prestamos', prestamoRouter);
routes.use('/ventas', ventaRouter);

export default routes;
