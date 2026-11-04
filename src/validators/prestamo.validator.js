import { body } from 'express-validator';

const estadosSalida = ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO'];
const camposPermitidos = new Set([
    'id_cliente',
    'id_empleado_despacha',
    'fecha_devolucion_esperada',
    'libros'
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

const validarLibros = body('libros')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un libro')
    .bail()
    .custom((libros) => libros.every((libro) => (
        libro
        && typeof libro === 'object'
        && !Array.isArray(libro)
        && Number.isInteger(Number(libro.id_libro))
        && Number(libro.id_libro) > 0
        && Number(libro.id_libro) <= 2147483647
        && Object.keys(libro).every((campo) => (
            campo === 'id_libro' || campo === 'estado_libro_salida'
        ))
        && (
            libro.estado_libro_salida === undefined
            || estadosSalida.includes(libro.estado_libro_salida)
        )
    )))
    .withMessage('Cada libro debe tener un id válido y un estado de salida permitido')
    .bail()
    .customSanitizer((libros) => libros.map((libro) => ({
        ...libro,
        id_libro: Number(libro.id_libro)
    })));

const crearPrestamoRules = [
    validarCuerpo,
    body('id_cliente')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id del cliente debe ser un entero positivo')
        .toInt(),
    body('id_empleado_despacha')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id del empleado debe ser un entero positivo')
        .toInt(),
    body('fecha_devolucion_esperada')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('La fecha de devolución debe tener formato YYYY-MM-DD')
        .bail()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage('La fecha de devolución no es válida'),
    validarLibros
];

export { crearPrestamoRules };