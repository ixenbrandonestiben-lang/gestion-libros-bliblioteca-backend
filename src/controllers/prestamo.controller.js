import prestamoService from '../services/prestamo.service.js';

const crear = async (req, res) => {
    const prestamo = await prestamoService.crear(req.body);

    return res.status(201).json({
        status: 'success',
        data: prestamo
    });
};

export default {
    crear
};