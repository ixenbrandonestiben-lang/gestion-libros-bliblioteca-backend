import ventaService from '../services/venta.service.js';

const listar = async (req, res) => {
    const resultado = await ventaService.listar({
        page: req.query.page,
        limit: req.query.limit
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
    const venta = await ventaService.crear(req.body);

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