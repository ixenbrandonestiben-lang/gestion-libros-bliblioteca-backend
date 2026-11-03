import { param } from 'express-validator';

const validacionIdAutor = [
    param('id_autor')
        .isInt({
            min: 1
        })
        .withMessage('El id del autor debe ser un entero positivo')
];

export default validacionIdAutor;
