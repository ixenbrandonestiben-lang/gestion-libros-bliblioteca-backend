const originsPermitidos = new Set(
    (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
);

const corsMiddleware = (req, res, next) => {
    const origin = req.get('origin');

    if (origin && originsPermitidos.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.vary('Origin');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(origin && !originsPermitidos.has(origin) ? 403 : 204);
    }

    return next();
};

export default corsMiddleware;
