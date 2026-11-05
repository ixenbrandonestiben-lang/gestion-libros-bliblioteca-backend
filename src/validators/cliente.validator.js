import { body, param } from 'express-validator';
import { ROLES_CLIENTE } from '../constants/index.js';

const estadosCuenta = ['ACTIVO', 'SUSPENDIDO', 'BLOQUEADO_POR_MORA'];
const camposPermitidos = new Set([
    'dpi',
    'nombre',
    'apellido',
    'telefono',
    'correo',
    'contrasena',
    'rol',
    'estado_cuenta'
]);

const validarCuerpo = body().custom((valor) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error('El cuerpo debe ser un objeto JSON');
    }

    if (Object.keys(valor).some((campo) => !camposPermitidos.has(campo))) {
        throw new Error('El cuerpo contiene campos no permitidos');
    }

    return true;
});

const texto = (campo, etiqueta, maximo, requerido = false) => {
    const regla = body(campo);

    if (!requerido) {
        regla.optional({ values: 'undefined' });
    }

    return regla
        .isString().withMessage(`${etiqueta} debe ser texto`)
        .bail()
        .trim()
        .notEmpty().withMessage(`${etiqueta} es obligatorio`)
        .bail()
        .isLength({ max: maximo }).withMessage(`${etiqueta} no puede superar ${maximo} caracteres`);
};

const telefono = () => body('telefono')
    .optional({ values: 'undefined', nullable: true })
    .isString().withMessage('El teléfono debe ser texto')
    .bail()
    .trim()
    .matches(/^[+\d\s().-]{7,20}$/).withMessage('El teléfono debe tener entre 7 y 20 caracteres válidos');

const correo = (requerido = false) => {
    const regla = body('correo');

    if (!requerido) {
        regla.optional({ values: 'undefined' });
    }

    return regla
        .isString().withMessage('El correo debe ser texto')
        .bail()
        .trim()
        .isEmail().withMessage('El correo no es válido')
        .bail()
        .isLength({ max: 250 }).withMessage('El correo no puede superar 250 caracteres')
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });
};

const contrasena = (requerida = false) => {
    const regla = body('contrasena');

    if (!requerida) {
        regla.optional({ values: 'undefined' });
    }

    return regla
        .isString().withMessage('La contraseña debe ser texto')
        .bail()
        .isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres')
        .bail()
        .custom((valor) => Buffer.byteLength(valor, 'utf8') <= 72)
        .withMessage('La contraseña no puede superar 72 bytes en UTF-8');
};

const rol = () => body('rol')
    .optional({ values: 'undefined' })
    .isIn(ROLES_CLIENTE).withMessage('El rol de cliente no es válido');

const estadoCuenta = () => body('estado_cuenta')
    .optional({ values: 'undefined' })
    .isIn(estadosCuenta).withMessage('El estado de cuenta no es válido');

const idClienteRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 }).withMessage('El id debe ser un entero positivo')
        .toInt()
];

const crearClienteRules = [
    validarCuerpo,
    texto('dpi', 'El DPI', 20, true),
    texto('nombre', 'El nombre', 100, true),
    texto('apellido', 'El apellido', 100, true),
    telefono(),
    correo(true),
    contrasena(true),
    rol(),
    estadoCuenta()
];

const actualizarClienteRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    texto('dpi', 'El DPI', 20),
    texto('nombre', 'El nombre', 100),
    texto('apellido', 'El apellido', 100),
    telefono(),
    correo(),
    contrasena(),
    rol(),
    estadoCuenta()
];

export {
    crearClienteRules,
    actualizarClienteRules,
    idClienteRules
};
