import { body, param } from 'express-validator';

export default class AutorValidator {
    static id() {
        return [
            param('id_autor')
                .isInt({ min: 1 })
                .withMessage('id_autor debe ser un entero positivo')
                .bail()
                .toInt()
        ];
    }

    static nombre() {
        return [
            body('nombre_autor')
                .isString()
                .withMessage('nombre_autor debe ser texto')
                .bail()
                .trim()
                .notEmpty()
                .withMessage('nombre_autor es obligatorio')
                .bail()
                .isLength({ min: 3, max: 150 })
                .withMessage('nombre_autor debe tener entre 3 y 150 caracteres')
        ];
    }
}
