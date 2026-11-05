import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import bcrypt from 'bcryptjs';

import { validarConfiguracion } from '../src/config/environment.js';

test('server configuration requires valid database, JWT and port settings', () => {
    const variables = [
        'DB_HOST',
        'DB_USER',
        'DB_NAME',
        'DB_PORT',
        'JWT_SECRET',
        'PORT',
        'SERVER_PORT'
    ];
    const anteriores = new Map(
        variables.map((variable) => [variable, process.env[variable]])
    );

    try {
        process.env.DB_HOST = 'localhost';
        process.env.DB_USER = 'test';
        process.env.DB_NAME = 'biblioteca_test';
        process.env.DB_PORT = '3306';
        process.env.PORT = '3001';
        delete process.env.SERVER_PORT;
        process.env.JWT_SECRET = 'short';

        assert.throws(validarConfiguracion, /JWT_SECRET/);

        process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
        assert.doesNotThrow(validarConfiguracion);

        process.env.DB_PORT = 'not-a-port';
        assert.throws(validarConfiguracion, /DB_PORT/);
    } finally {
        for (const [variable, value] of anteriores) {
            if (value === undefined) {
                delete process.env[variable];
            } else {
                process.env[variable] = value;
            }
        }
    }
});

test('development seed hashes match the documented passwords', async () => {
    const seed = readFileSync(
        new URL('../src/database/seeds.sql', import.meta.url),
        'utf8'
    );
    const hashes = seed
        .split("'")
        .filter((value) => value.startsWith('$2b$'));
    const hashByPassword = new Map([
        ['admin123', hashes[0]],
        ['admin456', hashes[1]],
        ['cliente123', hashes[2]]
    ]);

    assert.ok(hashByPassword.values().every(Boolean));
    for (const [password, hash] of hashByPassword) {
        assert.equal(await bcrypt.compare(password, hash), true);
    }
    assert.ok(hashes.every((hash) => hash === hashes[2] || hash === hashes[0] || hash === hashes[1]));
});
