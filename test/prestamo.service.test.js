import assert from 'node:assert/strict';
import { test } from 'node:test';

import PrestamoService from '../src/services/prestamo.service.js';

test('customer cannot read another customer loan', async () => {
    const service = new PrestamoService({
        modelo: {
            async buscarPorId() {
                return {
                    id_prestamo: 9,
                    id_cliente: 22,
                    libros: []
                };
            }
        }
    });

    await assert.rejects(
        service.buscarPorId(9, { idCliente: 21 }),
        (error) => error.status === 404
    );
});

test('loan return rejects missing details and returns a completed loan', async () => {
    const model = {
        async devolver(id, libros) {
            assert.equal(id, 9);
            assert.deepEqual(libros, [
                {
                    id_detalle_prestamo: 4,
                    estado_libro_entrada: 'BUENO'
                }
            ]);
            return {
                prestamo: {
                    id_prestamo: 9,
                    id_cliente: 22,
                    fecha_prestamo: '2026-11-01',
                    fecha_devolucion_esperada: '2026-11-15',
                    fecha_devolucion_real: '2026-11-04',
                    estado_prestamo: 'DEVUELTO',
                    multa_acumulada: '0.00',
                    id_empleado_despacha: 31,
                    created_at: '2026-11-01 10:00:00',
                    libros: [{
                        id_detalle_prestamo: 4,
                        id_libro: 5,
                        estado_libro_salida: 'BUENO',
                        estado_libro_entrada: 'BUENO'
                    }]
                }
            };
        }
    };
    const service = new PrestamoService({ modelo: model });
    const loan = await service.devolver(9, [
        {
            id_detalle_prestamo: 4,
            estado_libro_entrada: 'BUENO'
        }
    ]);

    assert.equal(loan.estado_prestamo, 'DEVUELTO');
    assert.equal(loan.libros[0].estado_libro_entrada, 'BUENO');
});
