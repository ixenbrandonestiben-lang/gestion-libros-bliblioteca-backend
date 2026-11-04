import assert from 'node:assert/strict';
import { test } from 'node:test';
import bcrypt from 'bcryptjs';

import { EmpleadoService } from '../src/services/empleado.service.js';

test('employee creation hashes the password and returns a public staff record', async () => {
    let employee;
    const model = {
        async crear(datos) {
            employee = {
                id_cliente: 12,
                ...datos
            };
            return 12;
        },
        async buscarEmpleado(id) {
            return id === 12 ? employee : null;
        }
    };
    const service = new EmpleadoService({ modelo: model });
    const result = await service.crear({
        dpi: 'DPI-12',
        nombre: 'Bea',
        apellido: 'Bibliotecaria',
        correo: 'bea@example.com',
        contrasena: 'ClaveSegura123',
        rol: 'BIBLIOTECARIO'
    });

    assert.equal(await bcrypt.compare('ClaveSegura123', employee.contrasena), true);
    assert.equal(result.rol, 'BIBLIOTECARIO');
});

test('employee management rejects a regular client as a staff account', async () => {
    const service = new EmpleadoService({
        modelo: {
            async buscarCuenta() {
                return { id_cliente: 14, rol: 'CLIENTE_REGULAR' };
            }
        }
    });

    await assert.rejects(
        service.actualizar(14, { nombre: 'No debe editarse' }),
        (error) => error.status === 404
    );
});

test('employee service protects the last active administrator and suspends rather than deletes', async () => {
    let update;
    const admin = {
        id_cliente: 1,
        rol: 'ADMIN',
        estado_cuenta: 'ACTIVO'
    };
    const model = {
        async buscarEmpleado(id) {
            return id === 1 ? admin : null;
        },
        async buscarCuenta(id) {
            return id === 1 ? admin : null;
        },
        async actualizar(id, changes) {
            update = changes;
            if (changes.rol === 'BIBLIOTECARIO' || changes.estado_cuenta === 'SUSPENDIDO') {
                return { lastAdmin: true };
            }
            return { updated: true };
        }
    };
    const service = new EmpleadoService({ modelo: model });

    await assert.rejects(
        service.actualizar(1, { rol: 'BIBLIOTECARIO' }),
        (error) => error.status === 409
    );
    await assert.rejects(
        service.eliminar(1),
        (error) => error.status === 409
    );
    assert.deepEqual(update, { estado_cuenta: 'SUSPENDIDO' });
});
