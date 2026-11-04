import { body, param } from 'express-validator';

const validarCuerpo = body().custom((valor) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error('El cuerpo debe ser un objeto JSON');
    }

    if (Object.keys(valor).some((campo) => campo !== 'nombre_genero')) {
        throw new Error('El cuerpo contiene campos no permitidos');
    }

    return true;
});

const nombreGenero = body('nombre_genero')
    .isString().withMessage('El nombre del género debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre del género debe contener entre 3 y 100 caracteres');

const idGeneroRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id debe ser un entero positivo')
        .toInt()
];

const crearGeneroRules = [
    validarCuerpo,
    nombreGenero
];

const actualizarGeneroRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    nombreGenero
];

export {
    crearGeneroRules,
    actualizarGeneroRules,
    idGeneroRules
};
