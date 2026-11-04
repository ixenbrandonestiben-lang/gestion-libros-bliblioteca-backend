import { prestamoService } from '../services/prestamo.service.js';
import { ROLES_PERSONAL } from '../constants/index.js';

const listar = async (req, res) => {
    const resultado = await prestamoService.listar({
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 50),
        ...(ROLES_PERSONAL.includes(req.user.rol)
            ? {}
            : { idCliente: req.user.id_cliente })
    });

    return res.status(200).json({
        status: 'success',
        ...resultado
    });
};

const buscarPorId = async (req, res) => {
    const prestamo = await prestamoService.buscarPorId(
        req.params.id,
        ROLES_PERSONAL.includes(req.user.rol)
            ? {}
            : { idCliente: req.user.id_cliente }
    );

    return res.status(200).json({
        status: 'success',
        data: prestamo
    });
};

const crear = async (req, res) => {
    const prestamo = await prestamoService.crear({
        ...req.body,
        id_empleado_despacha: req.user.id_cliente
    });

    return res.status(201).json({
        status: 'success',
        data: prestamo
    });
};

const devolver = async (req, res) => {
    const prestamo = await prestamoService.devolver(
        req.params.id,
        req.body.libros
    );

    return res.status(200).json({
        status: 'success',
        data: prestamo
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    devolver
};