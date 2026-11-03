import { body } from 'express-validator';

const validacionGenerosLiterarios = [
    body('nombre_genero')
        .trim()
        .notEmpty()
        .withMessage('El nombre del genero es obligatorio')
        .isLength({
            min: 3,
            max: 100
        })
        .withMessage(
            'El nombre debe contener entre 3 y 100 caracteres'
        )
];

export default validacionGenerosLiterarios;