import assert from 'node:assert/strict';
import { test } from 'node:test';

import { VentaService } from '../src/services/venta.service.js';

const crearModeloVenta = (overrides = {}) => ({
    async enTransaccion(operacion) {
        return operacion({});
    },
    async buscarClientesParaActualizar(conexion, ids) {
        return [
            { id_cliente: ids[0], rol: 'CLIENTE_REGULAR', estado_cuenta: 'ACTIVO' },
            { id_cliente: ids[1], rol: 'BIBLIOTECARIO', estado_cuenta: 'ACTIVO' }
        ];
    },
    async buscarLibrosParaActualizar() {
        return [{ id_libro: 4, titulo: 'Libro', precio: '10.00', stock: 5 }];
    },
    async crearEncabezado() {
        return 20;
    },
    async crearDetalles() {},
    async descontarStock() {
        return true;
    },
    async calcularTotal() {
        return '20.00';
    },
    async actualizarTotal() {
        return true;
    },
    async buscarDetalles() {
        return [{
            id_detalle_venta: 31,
            id_venta: 20,
            id_libro: 4,
            titulo: 'Libro',
            cantidad: 2,
            precio_unitario_historico: '10.00',
            subtotal: '20.00'
        }];
    },
    async listarVentas() {
        return [{
            id_venta: 20,
            id_cliente: 2,
            id_empleado_cajero: 3,
            fecha_venta: '2026-11-04',
            total: '20.00'
        }];
    },
    async contarVentas() {
        return 1;
    },
    async buscarVentaPorId(id) {
        return id === 20 ? {
            id_venta: 20,
            id_cliente: 2,
            id_empleado_cajero: 3,
            fecha_venta: '2026-11-04',
            total: '20.00'
        } : null;
    },
    async buscarDetallesPorVenta() {
        return [];
    },
    ...overrides
});

test('sale creation validates the cashier, discounts stock and returns historical details', async () => {
    let stockDiscount;
    const model = crearModeloVenta({
        async descontarStock(conexion, id, quantity) {
            stockDiscount = { id, quantity };
            return true;
        }
    });
    const service = new VentaService({ modelo: model });
    const sale = await service.crear({
        id_cliente: 2,
        id_empleado_cajero: 3,
        items: [{ id_libro: 4, cantidad: 2 }]
    });

    assert.deepEqual(stockDiscount, { id: 4, quantity: 2 });
    assert.equal(sale.id_venta, 20);
    assert.equal(sale.moneda, 'GTQ');
    assert.equal(sale.detalles[0].subtotal, '20.00');
});

test('sale creation rejects unauthorized cashier, missing books and insufficient stock', async () => {
    const unauthorizedModel = crearModeloVenta({
        async buscarClientesParaActualizar(conexion, ids) {
            return [
                { id_cliente: ids[0], rol: 'CLIENTE_REGULAR', estado_cuenta: 'ACTIVO' },
                { id_cliente: ids[1], rol: 'CLIENTE_REGULAR', estado_cuenta: 'ACTIVO' }
            ];
        }
    });
    await assert.rejects(
        new VentaService({ modelo: unauthorizedModel }).crear({
            id_cliente: 2,
            id_empleado_cajero: 3,
            items: [{ id_libro: 4, cantidad: 1 }]
        }),
        (error) => error.status === 403
    );

    const missingBookModel = crearModeloVenta({
        async buscarLibrosParaActualizar() {
            return [];
        }
    });
    await assert.rejects(
        new VentaService({ modelo: missingBookModel }).crear({
            id_cliente: 2,
            id_empleado_cajero: 3,
            items: [{ id_libro: 99, cantidad: 1 }]
        }),
        (error) => error.status === 404
    );

    await assert.rejects(
        new VentaService({ modelo: crearModeloVenta() }).crear({
            id_cliente: 2,
            id_empleado_cajero: 3,
            items: [{ id_libro: 4, cantidad: 99 }]
        }),
        (error) => error.status === 409
    );
});

test('sale listing paginates details and sale lookup reports missing ids', async () => {
    const model = crearModeloVenta({
        async buscarDetalles() {
            return [{
                id_detalle_venta: 31,
                id_venta: 20,
                id_libro: 4,
                titulo: 'Libro',
                cantidad: 2,
                precio_unitario_historico: '10.00',
                subtotal: '20.00'
            }];
        }
    });
    const service = new VentaService({ modelo: model });
    const result = await service.listar({ page: 2, limit: 10 });

    assert.deepEqual(result.pagination, {
        page: 2,
        limit: 10,
        total: 1,
        pages: 1
    });
    assert.equal(result.data[0].detalles.length, 1);
    assert.equal((await service.buscarPorId(20)).id_venta, 20);
    await assert.rejects(service.buscarPorId(99), (error) => error.status === 404);
});
