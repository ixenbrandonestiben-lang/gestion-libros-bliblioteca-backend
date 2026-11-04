import clienteService from '../services/cliente.service.js';

const listar = async (req, res) => {
    const clientes = await clienteService.listar();

    return res.status(200).json({
        status: 'success',
        data: clientes
    });
};

const buscarPorId = async (req, res) => {
    const cliente = await clienteService.buscarPorId(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: cliente
    });
};

const crear = async (req, res) => {
    const cliente = await clienteService.crear(req.body);

    return res.status(201).json({
        status: 'success',
        data: cliente
    });
};

const actualizar = async (req, res) => {
    const cliente = await clienteService.actualizar(req.params.id, req.body);

    return res.status(200).json({
        status: 'success',
        data: cliente
    });
};

const eliminar = async (req, res) => {
    await clienteService.eliminar(req.params.id);

    return res.status(200).json({
        status: 'success',
        message: 'Cliente eliminado correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};
