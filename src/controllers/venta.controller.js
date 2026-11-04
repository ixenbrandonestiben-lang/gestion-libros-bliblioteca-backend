import ventaService from '../services/venta.service.js';

const listar = async (req, res) => {
    const resultado = await ventaService.listar({
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 50)
    });

    return res.status(200).json({
        status: 'success',
        ...resultado
    });
};

const buscarPorId = async (req, res) => {
    const venta = await ventaService.buscarPorId(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: venta
    });
};

const crear = async (req, res) => {
    const venta = await ventaService.crear({
        ...req.body,
        id_empleado_cajero: req.user.id_cliente
    });

    return res.status(201).json({
        status: 'success',
        data: venta
    });
};

export default {
    listar,
    buscarPorId,
    crear
};