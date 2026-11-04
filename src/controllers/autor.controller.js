import AutorService from '../services/autor.service.js';

export default class AutorController {
    #servicio;

    constructor({ servicio = new AutorService() } = {}) {
        this.#servicio = servicio;
        this.listar = this.listar.bind(this);
        this.buscarPorId = this.buscarPorId.bind(this);
        this.crear = this.crear.bind(this);
        this.actualizar = this.actualizar.bind(this);
        this.eliminar = this.eliminar.bind(this);
    }

    async listar(req, res, next) {
        try {
            const autores = await this.#servicio.listar();
            return res.status(200).json({
                status: 'success',
                data: autores
            });
        } catch (error) {
            return next(error);
        }
    }

    async buscarPorId(req, res, next) {
        try {
            const autor = await this.#servicio.buscarPorId(
                Number(req.params.id_autor)
            );

            return res.status(200).json({
                status: 'success',
                data: autor
            });
        } catch (error) {
            return next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const autor = await this.#servicio.crear(req.body);

            return res.status(201).json({
                status: 'success',
                data: autor,
                message: 'Autor creado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const autor = await this.#servicio.actualizar(
                Number(req.params.id_autor),
                req.body
            );

            return res.status(200).json({
                status: 'success',
                data: autor,
                message: 'Autor actualizado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            await this.#servicio.eliminar(Number(req.params.id_autor));

            return res.status(200).json({
                status: 'success',
                message: 'Autor eliminado correctamente'
            });
        } catch (error) {
            return next(error);
        }
    }
}
