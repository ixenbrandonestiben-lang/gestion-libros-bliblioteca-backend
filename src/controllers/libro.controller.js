import libroService from '../services/libro.service.js';

const listar = async (req, res) => {
    const libros = await libroService.listar();

    return res.status(200).json({
        status: 'success',
        data: libros
    });
};

const buscarPorId = async (req, res) => {
    const libro = await libroService.buscarPorId(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: libro
    });
};

const crear = async (req, res) => {
    const libro = await libroService.crear(req.body);

    return res.status(201).json({
        status: 'success',
        data: libro
    });
};

const actualizar = async (req, res) => {
    const libro = await libroService.actualizar(req.params.id, req.body);

    return res.status(200).json({
        status: 'success',
        data: libro
    });
};

const eliminar = async (req, res) => {
    await libroService.eliminar(req.params.id);

    return res.status(200).json({
        status: 'success',
        message: 'Libro eliminado correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};