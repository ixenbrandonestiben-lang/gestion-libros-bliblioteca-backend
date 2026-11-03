import express from 'express';

import errorHandler from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

export default app;
