import { generoLiterarioService } from '../services/genero-literario.service.js';

const listar = async (req, res) => {
    const generos = await generoLiterarioService.listar();

    return res.status(200).json({
        status: 'success',
        data: generos
    });
};

const buscarPorId = async (req, res) => {
    const genero = await generoLiterarioService.buscarPorId(req.params.id);

    return res.status(200).json({
        status: 'success',
        data: genero
    });
};

const crear = async (req, res) => {
    const genero = await generoLiterarioService.crear(req.body);

    return res.status(201).json({
        status: 'success',
        data: genero
    });
};

const actualizar = async (req, res) => {
    const genero = await generoLiterarioService.actualizar(req.params.id, req.body);

    return res.status(200).json({
        status: 'success',
        data: genero
    });
};

const eliminar = async (req, res) => {
    await generoLiterarioService.eliminar(req.params.id);

    return res.status(200).json({
        status: 'success',
        message: 'Género literario eliminado correctamente'
    });
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};
