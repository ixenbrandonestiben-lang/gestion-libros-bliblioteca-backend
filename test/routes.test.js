import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import app from '../src/app.js';
import swaggerSpec from '../src/config/swagger.js';

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
});

test('auth index lists frontend endpoints', async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.endpoints.iniciarSesion, 'POST /api/v1/auth/login');
});

test('registration rejects attempts to choose a privileged role', async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dpi: 'TEST-002',
            nombre: 'Ada',
            apellido: 'Prueba',
            correo: 'ada2@example.com',
            contrasena: 'ClaveSegura123',
            rol: 'ADMIN'
        })
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.status, 'error');
});

test('protected frontend routes reject requests without a bearer token', async () => {
    const paths = [
        '/api/v1/auth/me',
        '/api/v1/clientes',
        '/api/v1/empleados',
        '/api/v1/ventas',
        '/api/v1/prestamos'
    ];

    for (const path of paths) {
        const response = await fetch(`${baseUrl}${path}`);
        assert.equal(response.status, 401, path);
    }
});

test('CORS allows configured local frontend origin and rejects unknown preflight origins', async () => {
    const allowed = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173' }
    });
    const rejected = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'OPTIONS',
        headers: { Origin: 'https://unknown.example' }
    });

    assert.equal(allowed.status, 204);
    assert.equal(
        allowed.headers.get('access-control-allow-origin'),
        'http://localhost:5173'
    );
    assert.equal(rejected.status, 403);
});

test('Swagger publishes auth and protected frontend endpoint contracts', async () => {
    const response = await fetch(`${baseUrl}/api-docs.json`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.openapi, '3.0.3');
    assert.ok(body.paths['/auth/login'].post);
    assert.ok(body.paths['/autores'].get);
    assert.ok(body.paths['/empleados'].post);
    assert.ok(body.paths['/prestamos/{id}/devolucion'].post);
    assert.ok(
        body.paths['/ventas'].post.security.some((requirement) => (
            Object.hasOwn(requirement, 'bearerAuth')
        ))
    );
    assert.equal(
        Object.hasOwn(swaggerSpec.components.schemas.VentaCreate.properties, 'id_empleado_cajero'),
        false
    );
});
