import authService from '../services/auth.service.js';

const registrar = async (req, res) => {
    const sesion = await authService.registrar(req.body);

    return res.status(201).json({
        status: 'success',
        data: sesion
    });
};

const iniciarSesion = async (req, res) => {
    const sesion = await authService.iniciarSesion(
        req.body.correo,
        req.body.contrasena
    );

    return res.status(200).json({
        status: 'success',
        data: sesion
    });
};

const perfil = (req, res) => res.status(200).json({
    status: 'success',
    data: req.user
});

const cerrarSesion = (req, res) => res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada. Elimina el token del almacenamiento del cliente.'
});

export default {
    registrar,
    iniciarSesion,
    perfil,
    cerrarSesion
};