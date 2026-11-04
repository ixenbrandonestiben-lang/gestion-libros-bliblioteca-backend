import { body, param } from 'express-validator';

const validarCuerpo = body().custom((valor) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error('El cuerpo debe ser un objeto JSON');
    }

    if (Object.keys(valor).some((campo) => campo !== 'nombre_autor')) {
        throw new Error('El cuerpo contiene campos no permitidos');
    }

    return true;
});

const nombreAutor = body('nombre_autor')
    .isString().withMessage('El nombre del autor debe ser texto')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre del autor es obligatorio')
    .bail()
    .isLength({ max: 150 })
    .withMessage('El nombre del autor no puede superar 150 caracteres');

const idAutorRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id debe ser un entero positivo')
        .toInt()
];

const crearAutorRules = [validarCuerpo, nombreAutor];
const actualizarAutorRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    nombreAutor
];

export {
    crearAutorRules,
    actualizarAutorRules,
    idAutorRules
};
