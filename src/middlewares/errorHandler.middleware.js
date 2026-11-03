const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    const status = Number.isInteger(error.status)
        ? error.status
        : 500;

    return res.status(status).json({
        status: 'error',
        message: status === 500
            ? 'Error interno del servidor'
            : error.message
    });
};

export default errorHandler;
