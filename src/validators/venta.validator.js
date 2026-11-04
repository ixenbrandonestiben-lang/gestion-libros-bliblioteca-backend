import { body, param, query } from 'express-validator';

const camposPermitidos = new Set([
    'id_cliente',
    'id_empleado_cajero',
    'items'
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

const validarItems = body('items')
    .isArray({ min: 1, max: 100 })
    .withMessage('La venta debe incluir entre 1 y 100 artículos')
    .bail()
    .custom((items) => items.every((item) => (
        item
        && typeof item === 'object'
        && !Array.isArray(item)
        && Number.isInteger(Number(item.id_libro))
        && Number(item.id_libro) > 0
        && Number(item.id_libro) <= 2147483647
        && Number.isInteger(Number(item.cantidad))
        && Number(item.cantidad) > 0
        && Number(item.cantidad) <= 2147483647
        && Object.keys(item).every((campo) => (
            campo === 'id_libro' || campo === 'cantidad'
        ))
    )))
    .withMessage('Cada artículo debe tener id_libro y cantidad enteros positivos; no envíe precios')
    .bail()
    .custom((items) => (
        new Set(items.map(({ id_libro: id }) => Number(id))).size === items.length
    ))
    .withMessage('No repita libros; indique la cantidad en un solo artículo')
    .bail()
    .customSanitizer((items) => items.map((item) => ({
        id_libro: Number(item.id_libro),
        cantidad: Number(item.cantidad)
    })));

const crearVentaRules = [
    validarCuerpo,
    body('id_cliente')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id del cliente debe ser un entero positivo')
        .toInt(),
    body('id_empleado_cajero')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id del cajero debe ser un entero positivo')
        .toInt(),
    validarItems
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

const listarVentasRules = [validarPagina, validarLimite];

const idVentaRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id de la venta debe ser un entero positivo')
        .toInt()
];

export {
    crearVentaRules,
    listarVentasRules,
    idVentaRules
};