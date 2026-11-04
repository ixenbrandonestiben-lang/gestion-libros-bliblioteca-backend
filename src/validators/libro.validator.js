import { body, param } from 'express-validator';

const camposPermitidos = new Set([
    'titulo',
    'isbn',
    'anio_publicacion',
    'paginas',
    'idioma_escritura',
    'precio',
    'stock',
    'id_autor',
    'id_editorial',
    'id_genero'
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

const texto = (campo, etiqueta, maximo, requerido = false, nullable = false) => {
    const regla = body(campo);

    if (!requerido) {
        regla.optional({ values: 'undefined', nullable });
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

const entero = (campo, etiqueta, min, max, requerido = false, nullable = false) => {
    const regla = body(campo);

    if (!requerido) {
        regla.optional({
            values: 'undefined',
            nullable
        });
    }

    return regla
        .isInt({ min, max }).withMessage(`${etiqueta} debe ser un entero válido`)
        .bail()
        .toInt();
};

const precio = (requerido = false) => {
    const regla = body('precio');

    if (!requerido) {
        regla.optional({ values: 'undefined' });
    }

    return regla
        .isFloat({ min: 0, max: 99999999.99 })
        .withMessage('El precio debe ser un número entre 0 y 99999999.99')
        .bail()
        .custom((valor) => {
            return /^\d{1,8}(?:\.\d{1,2})?$/.test(String(valor));
        })
        .withMessage('El precio no puede tener más de dos decimales')
        .toFloat();
};

const camposRequeridos = [
    texto('titulo', 'El título', 200, true),
    texto('isbn', 'El ISBN', 50, true),
    precio(true),
    entero('id_autor', 'El id del autor', 1, 2147483647, true),
    entero('id_editorial', 'El id de la editorial', 1, 2147483647, true),
    entero('id_genero', 'El id del género', 1, 2147483647, true)
];

const camposOpcionales = [
    entero('anio_publicacion', 'El año de publicación', 1, 9999, false, true),
    entero('paginas', 'El número de páginas', 1, 2147483647, false, true),
    texto('idioma_escritura', 'El idioma', 50, false, true),
    entero('stock', 'El stock', 0, 2147483647)
];

const camposParciales = [
    texto('titulo', 'El título', 200),
    texto('isbn', 'El ISBN', 50),
    precio(),
    entero('id_autor', 'El id del autor', 1, 2147483647),
    entero('id_editorial', 'El id de la editorial', 1, 2147483647),
    entero('id_genero', 'El id del género', 1, 2147483647)
];

const crearLibroRules = [
    validarCuerpo,
    ...camposRequeridos,
    ...camposOpcionales
];

const actualizarLibroRules = [
    validarCuerpo,
    body().custom((valor) => {
        if (Object.keys(valor).length === 0) {
            throw new Error('Debe enviar al menos un campo para actualizar');
        }

        return true;
    }),
    ...camposParciales,
    ...camposOpcionales
];

const reemplazarLibroRules = [
    validarCuerpo,
    ...camposRequeridos,
    ...camposOpcionales
];

const idLibroRules = [
    param('id')
        .isInt({ min: 1, max: 2147483647 })
        .withMessage('El id debe ser un entero positivo')
        .toInt()
];

export {
    crearLibroRules,
    actualizarLibroRules,
    reemplazarLibroRules,
    idLibroRules
};