import 'dotenv/config';
import { rateLimit } from 'express-rate-limit';

export class LimiterConfig {
    #api;
    #autenticacion;
    #escrituras;

    constructor({ env = process.env } = {}) {
        const ventanaMs = this.#leerEnteroPositivo(
            env.RATE_LIMIT_WINDOW_MS,
            15 * 60 * 1000,
            'RATE_LIMIT_WINDOW_MS'
        );

        this.#api = this.#crearLimitador(
            ventanaMs,
            this.#leerEnteroPositivo(
                env.API_RATE_LIMIT_MAX,
                120,
                'API_RATE_LIMIT_MAX'
            ),
            'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
        );

        this.#autenticacion = this.#crearLimitador(
            ventanaMs,
            this.#leerEnteroPositivo(
                env.AUTH_RATE_LIMIT_MAX,
                10,
                'AUTH_RATE_LIMIT_MAX'
            ),
            'Demasiados intentos de autenticación. Inténtalo de nuevo más tarde.'
        );

        this.#escrituras = this.#crearLimitador(
            ventanaMs,
            this.#leerEnteroPositivo(
                env.WRITE_RATE_LIMIT_MAX,
                60,
                'WRITE_RATE_LIMIT_MAX'
            ),
            'Se alcanzó el límite de operaciones de escritura. Inténtalo más tarde.'
        );
    }

    #leerEnteroPositivo(valor, predeterminado, nombre) {
        if (valor === undefined || valor === '') {
            return predeterminado;
        }

        const numero = Number(valor);

        if (!Number.isSafeInteger(numero) || numero < 1) {
            throw new Error(`${nombre} debe ser un entero positivo`);
        }

        return numero;
    }

    #crearLimitador(ventanaMs, limite, mensaje) {
        return rateLimit({
            windowMs: ventanaMs,
            max: limite,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                status: 'error',
                message: mensaje
            }
        });
    }

    get api() {
        return this.#api;
    }

    get autenticacion() {
        return this.#autenticacion;
    }

    get escrituras() {
        return this.#escrituras;
    }
}

const limiters = new LimiterConfig();

export default limiters;
