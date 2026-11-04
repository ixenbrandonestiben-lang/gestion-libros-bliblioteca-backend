import autorService from '../services/autor.service.js';

const listar = async (req, res) => res.status(200).json({
    status: 'success',
    data: await autorService.listar()
});

const buscarPorId = async (req, res) => res.status(200).json({
    status: 'success',
    data: await autorService.buscarPorId(req.params.id)
});

const crear = async (req, res) => res.status(201).json({
    status: 'success',
    data: await autorService.crear(req.body)
});

const actualizar = async (req, res) => res.status(200).json({
    status: 'success',
    data: await autorService.actualizar(req.params.id, req.body)
});

const eliminar = async (req, res) => {
    await autorService.eliminar(req.params.id);
    return res.status(200).json({
        status: 'success',
        message: 'Autor eliminado correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};
