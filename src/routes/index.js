import { Router } from 'express';

import autoresRouter from '../../routes/autores.router.js';
import editorialesRouter from '../../routes/editoriales.router.js';
import generosLiterariosRouter from '../../routes/generos-literarios.router.js';

const routes = Router();

routes.use('/autores', autoresRouter);
routes.use('/editoriales', editorialesRouter);
routes.use('/generos', generosLiterariosRouter);

export default routes;
