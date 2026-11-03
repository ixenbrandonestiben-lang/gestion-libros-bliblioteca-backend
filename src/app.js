import express from 'express';
import passport from 'passport';

import errorHandler from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
