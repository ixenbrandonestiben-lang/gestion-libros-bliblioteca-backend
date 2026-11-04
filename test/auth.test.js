import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { autorizarRoles } from '../src/middlewares/auth.middleware.js';
import { AuthService } from '../src/services/auth.service.js';

const originalJwtSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

after(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

test('register always creates a regular client and returns a JWT session', async () => {
    let created;
    const model = {
        async crearCliente(datos) {
            created = datos;
            return 17;
        },
        async buscarPorCorreo(correo) {
            return {
                id_cliente: 17,
                dpi: created.dpi,
                nombre: created.nombre,
                apellido: created.apellido,
                telefono: created.telefono,
                correo,
                contrasena: created.contrasena,
                rol: 'CLIENTE_REGULAR',
                estado_cuenta: 'ACTIVO'
            };
        }
    };
    const service = new AuthService({ modelo: model });
    const sesion = await service.registrar({
        dpi: 'TEST-001',
        nombre: 'Ada',
        apellido: 'Prueba',
        correo: 'ada@example.com',
        contrasena: 'ClaveSegura123'
    });

    assert.equal(created.rol, undefined);
    assert.equal(created.estado_cuenta, undefined);
    assert.notEqual(created.contrasena, 'ClaveSegura123');
    assert.equal(sesion.token_type, 'Bearer');
    assert.equal(sesion.expires_in, 28800);
    assert.equal(sesion.user.rol, 'CLIENTE_REGULAR');

    const payload = jwt.verify(sesion.token, process.env.JWT_SECRET, {
        issuer: 'biblioteca-villa-api',
        audience: 'biblioteca-villa-frontend'
    });
    assert.equal(payload.sub, '17');
    assert.equal(payload.rol, 'CLIENTE_REGULAR');
});

test('login rejects an incorrect password with a generic 401 error', async () => {
    const hash = await bcrypt.hash('ClaveCorrecta123', 4);
    const service = new AuthService({
        modelo: {
            async buscarPorCorreo() {
                return {
                    id_cliente: 3,
                    contrasena: hash,
                    estado_cuenta: 'ACTIVO'
                };
            }
        }
    });

    await assert.rejects(
        service.iniciarSesion('persona@example.com', 'incorrecta'),
        (error) => error.status === 401
            && error.message === 'Correo o contraseña incorrectos'
    );
});

test('role middleware forbids customers and permits authorized staff', () => {
    const middleware = autorizarRoles('ADMIN', 'BIBLIOTECARIO');
    let responseBody;
    let responseStatus;
    let nextCalled = false;
    const response = {
        status(status) {
            responseStatus = status;
            return this;
        },
        json(body) {
            responseBody = body;
            return this;
        }
    };

    middleware(
        { user: { rol: 'CLIENTE_REGULAR' } },
        response,
        () => {
            nextCalled = true;
        }
    );
    assert.equal(responseStatus, 403);
    assert.equal(responseBody.status, 'error');
    assert.equal(nextCalled, false);

    middleware(
        { user: { rol: 'BIBLIOTECARIO' } },
        response,
        () => {
            nextCalled = true;
        }
    );
    assert.equal(nextCalled, true);
});
