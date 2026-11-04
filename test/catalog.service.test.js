import assert from 'node:assert/strict';
import { test } from 'node:test';

import { AutorService } from '../src/services/autor.service.js';
import ClienteService from '../src/services/cliente.service.js';
import EditorialService from '../src/services/editorial.service.js';
import GeneroLiterarioService from '../src/services/genero-literario.service.js';
import LibroService from '../src/services/libro.service.js';

test('author service creates, updates, returns 404 for missing authors and protects referenced authors', async () => {
    let author = { id_autor: 1, nombre_autor: 'Autora' };
    const model = {
        async crear(nombre) {
            author = { id_autor: 1, nombre_autor: nombre };
            return 1;
        },
        async buscarPorId(id) {
            return id === author.id_autor ? author : null;
        },
        async actualizar(id, nombre) {
            author = { ...author, nombre_autor: nombre };
            return true;
        },
        async eliminar() {
            const error = new Error('Referenced row');
            error.code = 'ER_ROW_IS_REFERENCED_2';
            throw error;
        }
    };
    const service = new AutorService({ modelo: model });

    assert.deepEqual(await service.crear({ nombre_autor: 'Autora nueva' }), author);
    assert.equal((await service.actualizar(1, { nombre_autor: 'Autora editada' })).nombre_autor, 'Autora editada');
    await assert.rejects(service.buscarPorId(9), (error) => error.status === 404);
    await assert.rejects(service.eliminar(1), (error) => error.status === 409);
});

test('editorial service maps records and rejects deletion while books reference it', async () => {
    const model = {
        async listar() {
            return [{ id_editorial: 2, nombre_editorial: 'Editorial', created_at: '2026-01-01' }];
        },
        async buscarPorId(id) {
            return id === 2 ? { id_editorial: 2, nombre_editorial: 'Editorial' } : null;
        },
        async crear() {
            return 2;
        },
        async actualizar() {
            return true;
        },
        async eliminar() {
            const error = new Error('Referenced row');
            error.code = 'ER_ROW_IS_REFERENCED_2';
            throw error;
        }
    };
    const service = new EditorialService({ modelo: model });

    assert.equal((await service.listar())[0].id_editorial, 2);
    assert.equal((await service.crear({ nombre_editorial: 'Editorial' })).nombre_editorial, 'Editorial');
    await assert.rejects(service.buscarPorId(99), (error) => error.status === 404);
    await assert.rejects(service.eliminar(2), (error) => error.status === 409);
});

test('literary genre service supports create/update and translates foreign-key conflicts', async () => {
    let genre = { id_genero: 3, nombre_genero: 'Fantasía' };
    const model = {
        async listar() {
            return [genre];
        },
        async buscarPorId(id) {
            return id === 3 ? genre : null;
        },
        async crear(nombre) {
            genre = { id_genero: 3, nombre_genero: nombre };
            return 3;
        },
        async actualizar(id, nombre) {
            genre = { id_genero: id, nombre_genero: nombre };
            return true;
        },
        async eliminar() {
            const error = new Error('Referenced row');
            error.code = 'ER_ROW_IS_REFERENCED';
            throw error;
        }
    };
    const service = new GeneroLiterarioService({ modelo: model });

    assert.equal((await service.crear({ nombre_genero: 'Ciencia ficción' })).nombre_genero, 'Ciencia ficción');
    assert.equal((await service.actualizar(3, { nombre_genero: 'Fantasía' })).nombre_genero, 'Fantasía');
    await assert.rejects(service.buscarPorId(8), (error) => error.status === 404);
    await assert.rejects(service.eliminar(3), (error) => error.status === 409);
});

test('book service returns public DTO fields and maps duplicate ISBN and missing references', async () => {
    const registro = {
        id_libro: 5,
        titulo: 'Libro',
        isbn: 'ISBN-5',
        precio: '25.50',
        id_autor: 1,
        id_editorial: 2,
        id_genero: 3,
        contrasena: 'must not be returned'
    };
    const model = {
        async listar() {
            return [registro];
        },
        async buscarPorId(id) {
            return id === 5 ? registro : null;
        },
        async crear() {
            return 5;
        },
        async actualizar() {
            return true;
        },
        async eliminar(id) {
            return id === 5;
        }
    };
    const service = new LibroService({ modelo: model });

    const book = await service.crear({ titulo: 'Libro' });
    assert.equal(book.id_libro, 5);
    assert.equal(Object.hasOwn(book, 'contrasena'), false);
    assert.equal((await service.listar()).length, 1);
    assert.equal((await service.buscarPorId(5)).isbn, 'ISBN-5');
    await service.eliminar(5);
    await assert.rejects(service.buscarPorId(9), (error) => error.status === 404);

    const duplicateService = new LibroService({
        modelo: { async crear() {
            const error = new Error('duplicate');
            error.code = 'ER_DUP_ENTRY';
            throw error;
        } }
    });
    await assert.rejects(duplicateService.crear({}), (error) => error.status === 409);

    const referenceService = new LibroService({
        modelo: { async crear() {
            const error = new Error('missing reference');
            error.code = 'ER_NO_REFERENCED_ROW_2';
            throw error;
        } }
    });
    await assert.rejects(referenceService.crear({}), (error) => error.status === 422);
});

test('customer service hashes passwords and excludes them from public responses', async () => {
    let stored;
    const record = {
        id_cliente: 7,
        dpi: 'DPI-7',
        nombre: 'Ada',
        apellido: 'Prueba',
        correo: 'ada@example.com',
        rol: 'CLIENTE_REGULAR',
        estado_cuenta: 'ACTIVO'
    };
    const model = {
        async crear(datos) {
            stored = datos;
            return 7;
        },
        async buscarPorId(id) {
            return id === 7 ? { ...record, contrasena: stored.contrasena } : null;
        },
        async listar() {
            return [{ ...record, contrasena: 'private' }];
        },
        async actualizar() {
            return true;
        },
        async eliminar() {
            return true;
        }
    };
    const service = new ClienteService({ modelo: model });

    const customer = await service.crear({
        dpi: 'DPI-7',
        nombre: 'Ada',
        apellido: 'Prueba',
        correo: 'ada@example.com',
        contrasena: 'ClaveSegura123'
    });
    assert.notEqual(stored.contrasena, 'ClaveSegura123');
    assert.equal(Object.hasOwn(customer, 'contrasena'), false);
    assert.equal(Object.hasOwn((await service.listar())[0], 'contrasena'), false);
    await assert.rejects(service.buscarPorId(9), (error) => error.status === 404);
});
