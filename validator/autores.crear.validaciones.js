import { body, param } from 'express-validator';

const validacionAutores = [
    param('id_autor')
    .isInt()
    .withMessage('El id debe ser numérico'),
    body('nombre_autor')
        .trim()
        .notEmpty()
        .withMessage('El nombre del autor es obligatorio')
        .isString()
        .withMessage('El nombre debe ser texto')
        .isNumeric()
        .withMessage('el nombre del autor tiene que ser texto')
        .isLength({
            min: 3,
            max: 100
        })
        .withMessage(
            'El nombre debe contener entre 3 y 100 caracteres'
        )
];

export default validacionAutores;
