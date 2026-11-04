import express from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

import errorHandler from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(express.json());
app.use(passport.initialize());
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Biblioteca Villa API - Swagger',
    swaggerOptions: {
        persistAuthorization: true
    }
}));
app.get('/', (req, res) => res.redirect('/api/v1'));
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
