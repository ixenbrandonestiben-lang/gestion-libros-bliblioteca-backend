import { ROLES_PERSONAL } from '../constants/index.js';
import VentaDTO from '../dtos/venta.dto.js';
import VentaModel from '../models/venta.model.js';

export class ClienteVentaNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el cliente con id ${id}`);
        this.name = 'ClienteVentaNoEncontradoError';
        this.status = 404;
    }
}

export class CajeroNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el cajero con id ${id}`);
        this.name = 'CajeroNoEncontradoError';
        this.status = 404;
    }
}

export class CajeroNoAutorizadoError extends Error {
    constructor() {
        super('El usuario indicado no está autorizado para operar como cajero');
        this.name = 'CajeroNoAutorizadoError';
        this.status = 403;
    }
}

export class CajeroInactivoError extends Error {
    constructor() {
        super('La cuenta del cajero no está activa');
        this.name = 'CajeroInactivoError';
        this.status = 409;
    }
}

export class LibroVentaNoEncontradoError extends Error {
    constructor(ids) {
        super(`No se encontraron libros con id: ${ids.join(', ')}`);
        this.name = 'LibroVentaNoEncontradoError';
        this.status = 404;
    }
}

export class StockVentaInsuficienteError extends Error {
    constructor(ids) {
        super(`No hay stock suficiente para los libros con id: ${ids.join(', ')}`);
        this.name = 'StockVentaInsuficienteError';
        this.status = 409;
    }
}

export class VentaNoEncontradaError extends Error {
    constructor(id) {
        super(`No se encontró la venta con id ${id}`);
        this.name = 'VentaNoEncontradaError';
        this.status = 404;
    }
}

export class TotalVentaNoActualizadoError extends Error {
    constructor() {
        super('No se pudo guardar el total de la venta; la operación fue revertida');
        this.name = 'TotalVentaNoActualizadoError';
        this.status = 409;
    }
}

export class VentaService {
    #modelo;

    constructor({ modelo = VentaModel } = {}) {
        this.#modelo = modelo;
    }

    async crear(datos) {
        const venta = await this.#modelo.enTransaccion(async (conexion) => {
            const clientes = await this.#modelo.buscarClientesParaActualizar(
                conexion,
                [datos.id_cliente, datos.id_empleado_cajero]
            );
            const cliente = clientes.find(
                ({ id_cliente: id }) => id === datos.id_cliente
            );
            const cajero = clientes.find(
                ({ id_cliente: id }) => id === datos.id_empleado_cajero
            );

            if (!cliente) {
                throw new ClienteVentaNoEncontradoError(datos.id_cliente);
            }

            if (!cajero) {
                throw new CajeroNoEncontradoError(datos.id_empleado_cajero);
            }

            if (!ROLES_PERSONAL.includes(cajero.rol)) {
                throw new CajeroNoAutorizadoError();
            }

            if (cajero.estado_cuenta !== 'ACTIVO') {
                throw new CajeroInactivoError();
            }

            const libros = await this.#modelo.buscarLibrosParaActualizar(
                conexion,
                datos.items.map(({ id_libro: id }) => id)
            );
            const cantidadesPorLibro = new Map(
                datos.items.map(({ id_libro: id, cantidad }) => [id, cantidad])
            );
            const idsNoEncontrados = [...cantidadesPorLibro.keys()].filter(
                (id) => !libros.some(({ id_libro: libroId }) => libroId === id)
            );

            if (idsNoEncontrados.length > 0) {
                throw new LibroVentaNoEncontradoError(idsNoEncontrados);
            }

            const idsSinStock = libros
                .filter((libro) => (
                    libro.stock < cantidadesPorLibro.get(libro.id_libro)
                ))
                .map(({ id_libro: id }) => id);

            if (idsSinStock.length > 0) {
                throw new StockVentaInsuficienteError(idsSinStock);
            }

            const idVenta = await this.#modelo.crearEncabezado(conexion, datos);
            await this.#modelo.crearDetalles(
                conexion,
                idVenta,
                datos.items,
                libros
            );

            for (const [idLibro, cantidad] of cantidadesPorLibro) {
                const descontado = await this.#modelo.descontarStock(
                    conexion,
                    idLibro,
                    cantidad
                );

                if (!descontado) {
                    throw new StockVentaInsuficienteError([idLibro]);
                }
            }

            const total = await this.#modelo.calcularTotal(conexion, idVenta);
            const totalActualizado = await this.#modelo.actualizarTotal(
                conexion,
                idVenta,
                total
            );

            if (!totalActualizado) {
                throw new TotalVentaNoActualizadoError();
            }

            return {
                id_venta: idVenta,
                id_cliente: datos.id_cliente,
                id_empleado_cajero: datos.id_empleado_cajero,
                total,
                detalles: await this.#modelo.buscarDetalles(
                    conexion,
                    [idVenta]
                )
            };
        });

        return VentaDTO.desdeRegistro(venta);
    }

    async listar({ page = 1, limit = 50 } = {}) {
        const offset = (page - 1) * limit;
        const [ventas, total] = await Promise.all([
            this.#modelo.listarVentas(limit, offset),
            this.#modelo.contarVentas()
        ]);
        const detalles = await this.#modelo.buscarDetalles(
            null,
            ventas.map(({ id_venta: id }) => id)
        );
        const detallesPorVenta = this.#agruparDetalles(detalles);

        return {
            data: ventas.map((venta) => VentaDTO.desdeRegistro({
                ...venta,
                detalles: detallesPorVenta.get(venta.id_venta) ?? []
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async buscarPorId(id) {
        const venta = await this.#modelo.buscarVentaPorId(id);

        if (!venta) {
            throw new VentaNoEncontradaError(id);
        }

        const detalles = await this.#modelo.buscarDetallesPorVenta(id);

        return VentaDTO.desdeRegistro({ ...venta, detalles });
    }

    #agruparDetalles(detalles) {
        const porVenta = new Map();

        for (const detalle of detalles) {
            const grupo = porVenta.get(detalle.id_venta) ?? [];
            grupo.push(detalle);
            porVenta.set(detalle.id_venta, grupo);
        }

        return porVenta;
    }
}

const ventaService = new VentaService();

export default ventaService;
export { ventaService };