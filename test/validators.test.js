import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validationResult } from 'express-validator';

import {
    crearAutorRules,
    actualizarAutorRules
} from '../src/validators/autor.validator.js';
import {
    crearClienteRules,
    actualizarClienteRules
} from '../src/validators/cliente.validator.js';
import {
    crearEmpleadoRules,
    actualizarEmpleadoRules
} from '../src/validators/empleado.validator.js';
import {
    crearEditorialRules,
    actualizarEditorialRules
} from '../src/validators/editorial.validator.js';
import {
    crearGeneroRules,
    actualizarGeneroRules
} from '../src/validators/genero-literario.validator.js';
import {
    crearLibroRules,
    actualizarLibroRules
} from '../src/validators/libro.validator.js';
import {
    crearPrestamoRules,
    devolverPrestamoRules
} from '../src/validators/prestamo.validator.js';
import {
    crearVentaRules,
    listarVentasRules
} from '../src/validators/venta.validator.js';

const validar = async (rules, {
    body = {},
    params = {},
    query = {}
} = {}) => {
    const request = { body, params, query };
    await Promise.all(rules.map((rule) => rule.run(request)));
    return validationResult(request);
};

test('author, editorial and genre validators accept valid fields and reject unknown/empty fields', async () => {
    assert.equal((await validar(crearAutorRules, {
        body: { nombre_autor: 'Autora de prueba' }
    })).isEmpty(), true);
    assert.equal((await validar(actualizarAutorRules, { body: {} })).isEmpty(), false);
    assert.equal((await validar(crearAutorRules, {
        body: { nombre_autor: 'Autora', admin: true }
    })).isEmpty(), false);

    assert.equal((await validar(crearEditorialRules, {
        body: { nombre_editorial: 'Editorial' }
    })).isEmpty(), true);
    assert.equal((await validar(actualizarEditorialRules, {
        body: { nombre_editorial: '' }
    })).isEmpty(), false);

    assert.equal((await validar(crearGeneroRules, {
        body: { nombre_genero: 'Fantasía' }
    })).isEmpty(), true);
    assert.equal((await validar(actualizarGeneroRules, {
        body: { nombre_genero: 'X' }
    })).isEmpty(), false);
});

test('customer and employee validators enforce allowed role assignment and required data', async () => {
    const cliente = {
        dpi: 'DPI-1',
        nombre: 'Ada',
        apellido: 'Prueba',
        correo: 'ada@example.com',
        contrasena: 'ClaveSegura123',
        rol: 'CLIENTE_PREMIUM',
        estado_cuenta: 'ACTIVO'
    };
    assert.equal((await validar(crearClienteRules, { body: cliente })).isEmpty(), true);
    assert.equal((await validar(crearClienteRules, {
        body: { ...cliente, rol: 'ADMIN' }
    })).isEmpty(), false);
    assert.equal((await validar(actualizarClienteRules, { body: {} })).isEmpty(), false);

    const empleado = { ...cliente, rol: 'BIBLIOTECARIO' };
    assert.equal((await validar(crearEmpleadoRules, { body: empleado })).isEmpty(), true);
    assert.equal((await validar(crearEmpleadoRules, {
        body: { ...empleado, rol: 'CLIENTE_REGULAR' }
    })).isEmpty(), false);
    assert.equal((await validar(actualizarEmpleadoRules, {
        body: { rol: 'ADMIN' }
    })).isEmpty(), true);
});

test('book validator checks required fields, price precision, and non-empty partial updates', async () => {
    const book = {
        titulo: 'Libro de prueba',
        isbn: 'ISBN-TEST-1',
        precio: 12.5,
        id_autor: 1,
        id_editorial: 2,
        id_genero: 3
    };
    assert.equal((await validar(crearLibroRules, { body: book })).isEmpty(), true);
    assert.equal((await validar(crearLibroRules, {
        body: { ...book, precio: 1.234 }
    })).isEmpty(), false);
    assert.equal((await validar(actualizarLibroRules, { body: {} })).isEmpty(), false);
    assert.equal((await validar(actualizarLibroRules, {
        body: { stock: 0 }
    })).isEmpty(), true);
});

test('sale validator rejects client-supplied cashier, duplicate books and invalid pagination', async () => {
    const validSale = {
        id_cliente: 1,
        items: [{ id_libro: 2, cantidad: 1 }]
    };
    assert.equal((await validar(crearVentaRules, { body: validSale })).isEmpty(), true);
    assert.equal((await validar(crearVentaRules, {
        body: { ...validSale, id_empleado_cajero: 3 }
    })).isEmpty(), false);
    assert.equal((await validar(crearVentaRules, {
        body: {
            id_cliente: 1,
            items: [
                { id_libro: 2, cantidad: 1 },
                { id_libro: 2, cantidad: 2 }
            ]
        }
    })).isEmpty(), false);
    assert.equal((await validar(listarVentasRules, {
        query: { page: '0', limit: '101' }
    })).isEmpty(), false);
});

test('loan validator derives employee from auth and checks complete return item shapes', async () => {
    const validLoan = {
        id_cliente: 2,
        fecha_devolucion_esperada: '2030-01-01',
        libros: [{ id_libro: 3, estado_libro_salida: 'BUENO' }]
    };
    assert.equal((await validar(crearPrestamoRules, { body: validLoan })).isEmpty(), true);
    assert.equal((await validar(crearPrestamoRules, {
        body: { ...validLoan, id_empleado_despacha: 4 }
    })).isEmpty(), false);
    assert.equal((await validar(devolverPrestamoRules, {
        params: { id: '5' },
        body: {
            libros: [{
                id_detalle_prestamo: 8,
                estado_libro_entrada: 'PERDIDO'
            }]
        }
    })).isEmpty(), true);
    assert.equal((await validar(devolverPrestamoRules, {
        params: { id: '5' },
        body: {
            libros: [{
                id_detalle_prestamo: 8,
                estado_libro_entrada: 'NO_EXISTE'
            }]
        }
    })).isEmpty(), false);
});
