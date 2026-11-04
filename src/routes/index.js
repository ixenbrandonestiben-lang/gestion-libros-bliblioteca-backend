import { Router } from 'express';

import authRouter from './auth.routes.js';
import editorialRouter from './editorial.routes.js';
import libroRouter from './libro.routes.js';
import prestamoRouter from './prestamo.routes.js';
import ventaRouter from './venta.routes.js';

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/editoriales', editorialRouter);
routes.use('/libros', libroRouter);
routes.use('/prestamos', prestamoRouter);
routes.use('/ventas', ventaRouter);

export default routes;
