import editorialService from '../services/editorial.service.js';

const listar = async (req, res) => {
    const editoriales = await editorialService.listar();

    return res.status(200).json({
        status: 'success',
        data: editoriales
    });
};

const buscarPorId = async (req, res) => {
    const editorial = await editorialService.buscarPorId(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: editorial
    });
};

const crear = async (req, res) => {
    const editorial = await editorialService.crear(req.body);

    return res.status(201).json({
        status: 'success',
        data: editorial
    });
};

const actualizar = async (req, res) => {
    const editorial = await editorialService.actualizar(req.params.id, req.body);

    return res.status(200).json({
        status: 'success',
        data: editorial
    });
};

const eliminar = async (req, res) => {
    await editorialService.eliminar(req.params.id);

    return res.status(200).json({
        status: 'success',
        message: 'Editorial eliminada correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};
