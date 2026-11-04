import { body } from 'express-validator';

const camposRegistro = new Set([
    'dpi',
    'nombre',
    'apellido',
    'telefono',
    'correo',
    'contrasena'
]);

const validarCuerpo = (camposPermitidos) => body().custom((valor) => {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
        throw new Error('El cuerpo debe ser un objeto JSON');
    }

    if (Object.keys(valor).some((campo) => !camposPermitidos.has(campo))) {
        throw new Error('El cuerpo contiene campos no permitidos');
    }

    return true;
});

const validarRegistro = [
    validarCuerpo(camposRegistro),
    body('dpi')
        .isString().withMessage('El DPI debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El DPI es obligatorio')
        .bail()
        .isLength({ max: 20 }).withMessage('El DPI no puede superar 20 caracteres'),
    body('nombre')
        .isString().withMessage('El nombre debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .bail()
        .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
    body('apellido')
        .isString().withMessage('El apellido debe ser texto')
        .bail()
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio')
        .bail()
        .isLength({ max: 100 }).withMessage('El apellido no puede superar 100 caracteres'),
    body('telefono')
        .optional({ values: 'undefined', nullable: true })
        .isString().withMessage('El teléfono debe ser texto')
        .bail()
        .trim()
        .matches(/^[+\d\s().-]{7,20}$/)
        .withMessage('El teléfono debe tener entre 7 y 20 caracteres válidos'),
    body('correo')
        .isString().withMessage('El correo debe ser texto')
        .bail()
        .trim()
        .isEmail().withMessage('El correo no es válido')
        .bail()
        .isLength({ max: 250 }).withMessage('El correo no puede superar 250 caracteres')
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body('contrasena')
        .isString().withMessage('La contraseña debe ser texto')
        .bail()
        .isLength({ min: 8, max: 72 })
        .withMessage('La contraseña debe tener entre 8 y 72 caracteres')
        .bail()
        .custom((valor) => Buffer.byteLength(valor, 'utf8') <= 72)
        .withMessage('La contraseña no puede superar 72 bytes en UTF-8')
];

const camposLogin = new Set(['correo', 'contrasena']);
const validarInicioSesion = [
    validarCuerpo(camposLogin),
    body('correo')
        .isString().withMessage('El correo debe ser texto')
        .bail()
        .trim()
        .isEmail().withMessage('El correo no es válido')
        .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body('contrasena')
        .isString().withMessage('La contraseña debe ser texto')
        .bail()
        .notEmpty().withMessage('La contraseña es obligatoria')
        .bail()
        .isLength({ max: 72 })
        .withMessage('La contraseña no puede superar 72 caracteres')
];

export {
    validarRegistro,
    validarInicioSesion
};