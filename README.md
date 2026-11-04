# Biblioteca Villa API

API REST de gestión bibliotecaria organizada por capas dentro de `src/`.

## Requisitos

- Node.js
- MySQL

## Configuración

1. Instala las dependencias con `npm install`.
2. Crea un archivo `.env` en la raíz y configura las credenciales de base de
   datos, `JWT_SECRET` y `PORT`.

## Ejecución

- Desarrollo: `npm run dev`
- Producción: `npm start`
- Pruebas: `npm test`

La API agrupa sus endpoints bajo el prefijo `/api/v1`.

## Clientes

El CRUD de clientes está disponible en `/api/v1/clientes`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/clientes` | Listar clientes |
| GET | `/api/v1/clientes/:id` | Consultar un cliente |
| POST | `/api/v1/clientes` | Crear un cliente |
| PUT/PATCH | `/api/v1/clientes/:id` | Actualizar uno o más campos |
| DELETE | `/api/v1/clientes/:id` | Eliminar un cliente |

Para crear un cliente se requieren `dpi`, `nombre`, `apellido`, `correo` y
`contrasena` (mínimo 8 caracteres). `telefono` es opcional; `rol` y
`estado_cuenta` aceptan los valores definidos por la tabla `clientes` y, si se
omiten, usan `CLIENTE_REGULAR` y `ACTIVO`. Para actualizar, envía al menos un
campo permitido; el rol admite `CLIENTE_REGULAR` o `CLIENTE_PREMIUM`, la
contraseña es opcional y, cuando se envía, se guarda cifrada. Las respuestas
nunca incluyen la contraseña. Los errores de validación responden con HTTP
400, registros inexistentes con 404 y conflictos de duplicados o relaciones
existentes con 409.
