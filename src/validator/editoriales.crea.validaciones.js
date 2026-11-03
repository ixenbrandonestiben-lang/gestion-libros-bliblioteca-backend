import { body } from 'express-validator';

const validacionEditoriales = [
    body('nombre_editorial')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la editorial es obligatorio')
        .isLength({
            min: 3,
            max: 100
        })
        .withMessage(
            'El nombre debe contener entre 3 y 100 caracteres'
        )
];

export default validacionEditoriales;