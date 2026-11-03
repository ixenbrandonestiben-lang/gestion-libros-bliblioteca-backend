import assert from 'node:assert/strict';
import test from 'node:test';

import { Autores } from '../models/autores.model.js';

class BaseDeDatosFalsa {
    consultas = [];
    filas = [];
    resultado = {};

    async execute(sql, parametros = []) {
        this.consultas.push({
            sql: sql.replace(/\s+/g, ' ').trim(),
            parametros
        });

        if (sql.includes('SELECT')) {
            return [this.filas, []];
        }

        return [this.resultado, []];
    }
}

test('listar devuelve autores como objetos DTO', async () => {
    const database = new BaseDeDatosFalsa();
    database.filas = [
        { id_autor: 1, nombre_autor: 'Autora Uno' },
        { id_autor: 2, nombre_autor: 'Autor Dos' }
    ];
    const autores = new Autores(database);

    assert.deepEqual(await autores.listar(), [
        { id: 1, nombre_autor: 'Autora Uno' },
        { id: 2, nombre_autor: 'Autor Dos' }
    ]);
    assert.match(database.consultas[0].sql, /ORDER BY id_autor/);
});

test('buscarPorId devuelve el autor o null si no existe', async (t) => {
    const database = new BaseDeDatosFalsa();
    const autores = new Autores(database);

    await t.test('autor encontrado', async () => {
        database.filas = [
            { id_autor: 7, nombre_autor: 'Autora Siete' }
        ];

        assert.deepEqual(await autores.buscarPorId(7), {
            id: 7,
            nombre_autor: 'Autora Siete'
        });
        assert.deepEqual(database.consultas.at(-1).parametros, [7]);
    });

    await t.test('autor no encontrado', async () => {
        database.filas = [];

        assert.equal(await autores.buscarPorId(99), null);
    });
});

test('crear inserta el nombre y devuelve el DTO con el id generado', async () => {
    const database = new BaseDeDatosFalsa();
    database.resultado = { insertId: 12 };
    const autores = new Autores(database);

    assert.deepEqual(await autores.crear({
        nombre_autor: 'Autora Nueva'
    }), {
        id: 12,
        nombre_autor: 'Autora Nueva'
    });
    assert.deepEqual(database.consultas[0].parametros, ['Autora Nueva']);
});

test('actualizar devuelve el autor actualizado o null si no existe', async (t) => {
    const database = new BaseDeDatosFalsa();
    const autores = new Autores(database);

    await t.test('autor encontrado', async () => {
        database.filas = [
            { id_autor: 4, nombre_autor: 'Nombre Actualizado' }
        ];

        assert.deepEqual(await autores.actualizar(4, {
            nombre_autor: 'Nombre Actualizado'
        }), {
            id: 4,
            nombre_autor: 'Nombre Actualizado'
        });
        assert.deepEqual(database.consultas[0].parametros, [
            'Nombre Actualizado',
            4
        ]);
    });

    await t.test('autor no encontrado', async () => {
        database.filas = [];

        assert.equal(await autores.actualizar(99, {
            nombre_autor: 'Nombre Actualizado'
        }), null);
    });
});

test('eliminar indica si encontró y eliminó un autor', async (t) => {
    const database = new BaseDeDatosFalsa();
    const autores = new Autores(database);

    await t.test('autor eliminado', async () => {
        database.resultado = { affectedRows: 1 };

        assert.equal(await autores.eliminar(3), true);
        assert.deepEqual(database.consultas.at(-1).parametros, [3]);
    });

    await t.test('autor inexistente', async () => {
        database.resultado = { affectedRows: 0 };

        assert.equal(await autores.eliminar(99), false);
    });
});
