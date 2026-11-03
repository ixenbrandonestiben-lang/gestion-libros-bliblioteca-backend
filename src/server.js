import 'dotenv/config';

import app from './app.js';

const port = process.env.PORT || process.env.SERVER_PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
