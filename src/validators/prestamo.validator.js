import { body, param, query } from 'express-validator';

const estadosSalida = ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO'];
const camposPermitidos = new Set([
    'id_cliente',
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
    body('fecha_devolucion_esperada')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('La fecha de devolución debe tener formato YYYY-MM-DD')
        .bail()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage('La fecha de devolución no es válida'),
    validarLibros
];

const validarPagina = query('page')
    .optional()
    .isInt({ min: 1, max: 21474836 })
    .withMessage('page debe ser un entero positivo')
    .toInt();

const validarLimite = query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un entero entre 1 y 100')
    .toInt();

const listarPrestamosRules = [validarPagina, validarLimite];

const idPrestamoRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id del préstamo debe ser un entero positivo')
        .toInt()
];

const estadosEntrada = ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO', 'PERDIDO'];
const devolverPrestamoRules = [
    ...idPrestamoRules,
    body().custom((valor) => {
        if (
            !valor
            || typeof valor !== 'object'
            || Array.isArray(valor)
            || Object.keys(valor).some((campo) => campo !== 'libros')
        ) {
            throw new Error('El cuerpo debe contener únicamente el campo libros');
        }

        return true;
    }),
    body('libros')
        .isArray({ min: 1 })
        .withMessage('Debe incluir el estado de cada libro devuelto')
        .bail()
        .custom((libros) => libros.every((libro) => (
            libro
            && typeof libro === 'object'
            && !Array.isArray(libro)
            && Number.isInteger(Number(libro.id_detalle_prestamo))
            && Number(libro.id_detalle_prestamo) > 0
            && Object.keys(libro).every((campo) => (
                campo === 'id_detalle_prestamo' || campo === 'estado_libro_entrada'
            ))
            && estadosEntrada.includes(libro.estado_libro_entrada)
        )))
        .withMessage('Cada libro debe incluir un detalle válido y un estado de entrada permitido')
        .bail()
        .custom((libros) => (
            new Set(libros.map(({ id_detalle_prestamo: id }) => Number(id))).size
            === libros.length
        ))
        .withMessage('No repita los detalles del préstamo')
        .bail()
        .customSanitizer((libros) => libros.map((libro) => ({
            id_detalle_prestamo: Number(libro.id_detalle_prestamo),
            estado_libro_entrada: libro.estado_libro_entrada
        })))
];

export {
    crearPrestamoRules,
    listarPrestamosRules,
    idPrestamoRules,
    devolverPrestamoRules
};