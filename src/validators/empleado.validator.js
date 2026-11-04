import { body, param } from 'express-validator';

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

const campoTexto = (campo, etiqueta, maximo, requerido = false) => {
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
        .isLength({ max: maximo })
        .withMessage(`${etiqueta} no puede superar ${maximo} caracteres`);
};

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
        .isLength({ min: 8, max: 72 })
        .withMessage('La contraseña debe tener entre 8 y 72 caracteres')
        .bail()
        .custom((valor) => Buffer.byteLength(valor, 'utf8') <= 72)
        .withMessage('La contraseña no puede superar 72 bytes en UTF-8');
};

const rolEmpleado = () => body('rol')
    .isIn(['ADMIN', 'BIBLIOTECARIO'])
    .withMessage('El rol debe ser ADMIN o BIBLIOTECARIO');

const estadoCuenta = () => body('estado_cuenta')
    .optional({ values: 'undefined' })
    .isIn(['ACTIVO', 'SUSPENDIDO'])
    .withMessage('El estado de cuenta no es válido');

const telefono = () => body('telefono')
    .optional({ values: 'undefined', nullable: true })
    .isString().withMessage('El teléfono debe ser texto')
    .bail()
    .trim()
    .matches(/^[+\d\s().-]{7,20}$/)
    .withMessage('El teléfono debe tener entre 7 y 20 caracteres válidos');

const idEmpleadoRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id debe ser un entero positivo')
        .toInt()
];

const crearEmpleadoRules = [
    validarCuerpo,
    campoTexto('dpi', 'El DPI', 20, true),
    campoTexto('nombre', 'El nombre', 100, true),
    campoTexto('apellido', 'El apellido', 100, true),
    telefono(),
    correo(true),
    contrasena(true),
    rolEmpleado(),
    estadoCuenta()
];

const actualizarEmpleadoRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    campoTexto('dpi', 'El DPI', 20),
    campoTexto('nombre', 'El nombre', 100),
    campoTexto('apellido', 'El apellido', 100),
    telefono(),
    correo(),
    contrasena(),
    body('rol')
        .optional({ values: 'undefined' })
        .isIn(['ADMIN', 'BIBLIOTECARIO', 'CLIENTE_REGULAR', 'CLIENTE_PREMIUM'])
        .withMessage('El rol de cuenta no es válido'),
    estadoCuenta()
];

export {
    crearEmpleadoRules,
    actualizarEmpleadoRules,
    idEmpleadoRules
};
