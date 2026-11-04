import PrestamoDTO from '../dtos/prestamo.dto.js';
import PrestamoModel from '../models/prestamo.model.js';

export class ClientePrestamoNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el cliente con id ${id}`);
        this.name = 'ClientePrestamoNoEncontradoError';
        this.status = 404;
    }
}

export class ClienteBloqueadoError extends Error {
    constructor() {
        super('El cliente está bloqueado por mora y no puede recibir préstamos');
        this.name = 'ClienteBloqueadoError';
        this.status = 409;
    }
}

export class ClienteSuspendidoError extends Error {
    constructor() {
        super('La cuenta del cliente está suspendida y no puede recibir préstamos');
        this.name = 'ClienteSuspendidoError';
        this.status = 409;
    }
}

export class ClienteBloqueadoPorMoraError extends Error {
    constructor() {
        super('No se puede crear el préstamo: el cliente tiene préstamos vencidos y su cuenta fue bloqueada por mora');
        this.name = 'ClienteBloqueadoPorMoraError';
        this.status = 409;
    }
}

export class FechaDevolucionInvalidaError extends Error {
    constructor() {
        super('La fecha de devolución esperada debe ser posterior al día de hoy');
        this.name = 'FechaDevolucionInvalidaError';
        this.status = 400;
    }
}

export class LibroPrestamoNoEncontradoError extends Error {
    constructor(ids) {
        super(`No se encontraron libros con id: ${ids.join(', ')}`);
        this.name = 'LibroPrestamoNoEncontradoError';
        this.status = 404;
    }
}

export class StockInsuficienteError extends Error {
    constructor(ids) {
        super(`No hay suficientes ejemplares disponibles para los libros: ${ids.join(', ')}`);
        this.name = 'StockInsuficienteError';
        this.status = 409;
    }
}

export class ReferenciaPrestamoNoEncontradaError extends Error {
    constructor(causa) {
        super('No se encontró el empleado indicado para despachar el préstamo', {
            cause: causa
        });
        this.name = 'ReferenciaPrestamoNoEncontradaError';
        this.status = 422;
    }
}

export class PrestamoNoEncontradoError extends Error {
    constructor(id) {
        super(`No se encontró el préstamo con id ${id}`);
        this.name = 'PrestamoNoEncontradoError';
        this.status = 404;
    }
}

export class PrestamoYaDevueltoError extends Error {
    constructor() {
        super('El préstamo ya fue devuelto');
        this.name = 'PrestamoYaDevueltoError';
        this.status = 409;
    }
}

export class DetallesDevolucionInvalidosError extends Error {
    constructor() {
        super('Debe enviar una sola vez el detalle de cada libro pendiente del préstamo');
        this.name = 'DetallesDevolucionInvalidosError';
        this.status = 400;
    }
}

export default class PrestamoService {
    #modelo;

    constructor({ modelo = PrestamoModel } = {}) {
        this.#modelo = modelo;
    }

    async crear(datos) {
        let resultado;

        try {
            resultado = await this.#modelo.enTransaccion(async (conexion) => {
                const cliente = await this.#modelo.buscarClienteParaActualizar(
                    conexion,
                    datos.id_cliente
                );

                if (!cliente) {
                    throw new ClientePrestamoNoEncontradoError(datos.id_cliente);
                }

                if (cliente.estado_cuenta === 'BLOQUEADO_POR_MORA') {
                    throw new ClienteBloqueadoError();
                }

                if (cliente.estado_cuenta !== 'ACTIVO') {
                    throw new ClienteSuspendidoError();
                }

                const fechaValida = await this.#modelo.validarFechaDevolucion(
                    conexion,
                    datos.fecha_devolucion_esperada
                );

                if (!fechaValida) {
                    throw new FechaDevolucionInvalidaError();
                }

                const prestamosVencidos = await this.#modelo.buscarPrestamosVencidos(
                    conexion,
                    datos.id_cliente
                );

                if (prestamosVencidos.length > 0) {
                    await this.#modelo.marcarPrestamosVencidos(
                        conexion,
                        prestamosVencidos
                    );
                    await this.#modelo.bloquearClientePorMora(
                        conexion,
                        datos.id_cliente
                    );

                    return { bloqueadoPorMora: true };
                }

                const cantidadesSolicitadas = new Map();
                for (const libro of datos.libros) {
                    cantidadesSolicitadas.set(
                        libro.id_libro,
                        (cantidadesSolicitadas.get(libro.id_libro) ?? 0) + 1
                    );
                }

                const librosDisponibles = await this.#modelo.buscarLibrosParaActualizar(
                    conexion,
                    datos.libros.map(({ id_libro: idLibro }) => idLibro)
                );
                const idsNoEncontrados = [...cantidadesSolicitadas.keys()].filter(
                    (idLibro) => !librosDisponibles.some(
                        (libro) => libro.id_libro === idLibro
                    )
                );

                if (idsNoEncontrados.length > 0) {
                    throw new LibroPrestamoNoEncontradoError(idsNoEncontrados);
                }

                const idsSinStock = librosDisponibles
                    .filter((libro) => (
                        libro.stock < cantidadesSolicitadas.get(libro.id_libro)
                    ))
                    .map(({ id_libro: idLibro }) => idLibro);

                if (idsSinStock.length > 0) {
                    throw new StockInsuficienteError(idsSinStock);
                }

                const idPrestamo = await this.#modelo.crearEncabezado(
                    conexion,
                    datos
                );

                for (const [idLibro, cantidad] of cantidadesSolicitadas) {
                    const descontado = await this.#modelo.descontarStock(
                        conexion,
                        idLibro,
                        cantidad
                    );

                    if (!descontado) {
                        throw new StockInsuficienteError([idLibro]);
                    }
                }

                await this.#modelo.crearDetalles(
                    conexion,
                    idPrestamo,
                    datos.libros
                );

                return {
                    bloqueadoPorMora: false,
                    prestamo: await this.#modelo.buscarPrestamoCreado(
                        conexion,
                        idPrestamo
                    )
                };
            });
        } catch (error) {
            if (
                error.code === 'ER_NO_REFERENCED_ROW_2'
                || error.code === 'ER_NO_REFERENCED_ROW'
            ) {
                throw new ReferenciaPrestamoNoEncontradaError(error);
            }

            throw error;
        }

        if (resultado.bloqueadoPorMora) {
            throw new ClienteBloqueadoPorMoraError();
        }

        return PrestamoDTO.desdeRegistro(resultado.prestamo);
    }

    async listar({ page = 1, limit = 50, idCliente } = {}) {
        const resultado = await this.#modelo.listar({ page, limit, idCliente });
        const librosPorPrestamo = new Map();

        for (const libro of resultado.libros) {
            const libros = librosPorPrestamo.get(libro.id_prestamo) ?? [];
            libros.push(libro);
            librosPorPrestamo.set(libro.id_prestamo, libros);
        }

        return {
            data: resultado.prestamos.map((prestamo) => PrestamoDTO.desdeRegistro({
                ...prestamo,
                libros: librosPorPrestamo.get(prestamo.id_prestamo) ?? []
            })),
            pagination: {
                page,
                limit,
                total: resultado.total,
                pages: Math.ceil(resultado.total / limit)
            }
        };
    }

    async buscarPorId(id, { idCliente } = {}) {
        const prestamo = await this.#modelo.buscarPorId(id);

        if (!prestamo || (
            idCliente !== undefined
            && prestamo.id_cliente !== idCliente
        )) {
            throw new PrestamoNoEncontradoError(id);
        }

        return PrestamoDTO.desdeRegistro(prestamo);
    }

    async devolver(id, libros) {
        const resultado = await this.#modelo.devolver(id, libros);

        if (resultado.notFound) {
            throw new PrestamoNoEncontradoError(id);
        }
        if (resultado.alreadyReturned) {
            throw new PrestamoYaDevueltoError();
        }
        if (resultado.invalidDetails) {
            throw new DetallesDevolucionInvalidosError();
        }

        return PrestamoDTO.desdeRegistro(resultado.prestamo);
    }
}

const prestamoService = new PrestamoService();

export { prestamoService };