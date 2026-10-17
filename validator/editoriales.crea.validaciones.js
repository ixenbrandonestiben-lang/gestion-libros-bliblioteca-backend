import { body, param } from 'express-validator';

const validacionEditoriales = [
    param('id_editorial')
    .isInt()
    .withMessage('El id debe ser numérico'),
    body('nombre_editorial')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la editorial es obligatorio')
        .isString()
        .withMessage('El nombre debe ser texto')
        .isNumeric()
        .withMessage('el nombre de la editorial tiene que ser texto')
        .isLength({
            min: 3,
            max: 100
        })
        .withMessage(
            'El nombre debe contener entre 3 y 100 caracteres'
        )
];

export default validacionEditoriales;
