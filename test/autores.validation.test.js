import assert from 'node:assert/strict';
import test from 'node:test';
import { validationResult } from 'express-validator';

import validacionAutores from '../validator/autores.crear.validaciones.js';
import validacionIdAutor from '../validator/autores.id.validaciones.js';

async function obtenerErrores(validadores, req) {
    for (const validador of validadores) {
        await validador.run(req);
    }

    return validationResult(req).array();
}

test('la validación acepta nombres de autor y los limpia', async () => {
    const req = {
        body: { nombre_autor: '  Ana María  ' },
        params: {}
    };

    assert.deepEqual(await obtenerErrores(validacionAutores, req), []);
    assert.equal(req.body.nombre_autor, 'Ana María');
});

test('la validación rechaza nombre vacío y valores que no son texto', async (t) => {
    await t.test('nombre vacío', async () => {
        const req = {
            body: { nombre_autor: '   ' },
            params: {}
        };

        assert.ok((await obtenerErrores(validacionAutores, req)).length > 0);
    });

    await t.test('valor que no es texto', async () => {
        const req = {
            body: { nombre_autor: 123 },
            params: {}
        };

        assert.ok((await obtenerErrores(validacionAutores, req)).length > 0);
    });
});

test('la validación de ID acepta enteros positivos y rechaza el resto', async (t) => {
    await t.test('entero positivo', async () => {
        const req = {
            body: {},
            params: { id_autor: '1' }
        };

        assert.deepEqual(await obtenerErrores(validacionIdAutor, req), []);
    });

    await t.test('cero y texto', async () => {
        for (const id of ['0', 'abc']) {
            const req = {
                body: {},
                params: { id_autor: id }
            };

            assert.ok((await obtenerErrores(validacionIdAutor, req)).length > 0);
        }
    });
});
