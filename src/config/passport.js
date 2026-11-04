import 'dotenv/config';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

export class PassportAuth {
    #passport;
    #nombreCookie;

    constructor({
        env = process.env,
        passportInstance = passport
    } = {}) {
        const secreto = env.JWT_SECRET?.trim();

        if (!secreto) {
            throw new Error(
                'JWT_SECRET es obligatorio para configurar la autenticación JWT'
            );
        }

        if (secreto.length < 32) {
            throw new Error(
                'JWT_SECRET debe tener al menos 32 caracteres'
            );
        }

        this.#passport = passportInstance;
        this.#nombreCookie = env.JWT_COOKIE_NAME?.trim() || 'access_token';
        this.#configurarEstrategia(secreto);
    }

    #configurarEstrategia(secreto) {
        const extraerCookie = (solicitud) => {
            const cookiesParseadas = solicitud.cookies;
            const tokenParseado = cookiesParseadas?.[this.#nombreCookie];

            if (typeof tokenParseado === 'string' && tokenParseado.length > 0) {
                return tokenParseado;
            }

            const encabezadoCookie = solicitud.headers?.cookie;

            if (typeof encabezadoCookie !== 'string') {
                return null;
            }

            for (const cookie of encabezadoCookie.split(';')) {
                const separador = cookie.indexOf('=');

                if (separador < 0) {
                    continue;
                }

                const nombre = cookie.slice(0, separador).trim();

                if (nombre === this.#nombreCookie) {
                    const valor = cookie.slice(separador + 1).trim();
                    return valor || null;
                }
            }

            return null;
        };

        const estrategia = new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    ExtractJwt.fromAuthHeaderAsBearerToken(),
                    extraerCookie
                ]),
                secretOrKey: secreto,
                algorithms: ['HS256']
            },
            (payload, done) => {
                if (
                    payload === null
                    || typeof payload !== 'object'
                    || Array.isArray(payload)
                ) {
                    return done(null, false);
                }

                return done(null, payload);
            }
        );

        this.#passport.use('jwt', estrategia);
    }

    initialize() {
        return this.#passport.initialize();
    }

    authenticate(opciones = {}) {
        return this.#passport.authenticate('jwt', {
            ...opciones,
            session: false
        });
    }
}

const passportAuth = new PassportAuth();

export default passportAuth;
