import { body } from 'express-validator';

const validacionAutores = [
    body('nombre_autor')
        .isString()
        .withMessage('El nombre del autor debe ser texto')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('El nombre del autor es obligatorio')
        .bail()
        .isLength({
            min: 3,
            max: 150
        })
        .withMessage(
            'El nombre debe contener entre 3 y 150 caracteres'
        )
];

export default validacionAutores;
