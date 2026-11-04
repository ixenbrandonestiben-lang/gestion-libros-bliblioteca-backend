import empleadoService from '../services/empleado.service.js';

const listar = async (req, res) => res.status(200).json({
    status: 'success',
    data: await empleadoService.listar()
});

const buscarPorId = async (req, res) => res.status(200).json({
    status: 'success',
    data: await empleadoService.buscarPorId(req.params.id)
});

const crear = async (req, res) => res.status(201).json({
    status: 'success',
    data: await empleadoService.crear(req.body)
});

const actualizar = async (req, res) => res.status(200).json({
    status: 'success',
    data: await empleadoService.actualizar(req.params.id, req.body)
});

const eliminar = async (req, res) => {
    await empleadoService.eliminar(req.params.id);
    return res.status(200).json({
        status: 'success',
        message: 'Empleado suspendido correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};
