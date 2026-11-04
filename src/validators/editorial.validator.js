import { body, param } from 'express-validator';

const validarCuerpo = body().custom((valor) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error('El cuerpo debe ser un objeto JSON');
    }

    if (Object.keys(valor).some((campo) => campo !== 'nombre_editorial')) {
        throw new Error('El cuerpo contiene campos no permitidos');
    }

    return true;
});

const nombreEditorial = body('nombre_editorial')
    .isString().withMessage('El nombre de la editorial debe ser texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre de la editorial es obligatorio')
    .bail()
    .isLength({ max: 150 })
    .withMessage('El nombre de la editorial no puede superar 150 caracteres');

const idEditorialRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id debe ser un entero positivo')
        .toInt()
];

const crearEditorialRules = [
    validarCuerpo,
    nombreEditorial
];

const actualizarEditorialRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    nombreEditorial
];

export {
    crearEditorialRules,
    actualizarEditorialRules,
    idEditorialRules
};
