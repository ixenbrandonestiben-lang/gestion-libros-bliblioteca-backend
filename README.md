# Biblioteca Villa API

API REST de gestión bibliotecaria organizada por capas dentro de `src/`.

## Requisitos

- Node.js
- MySQL

## Configuración

1. Instala las dependencias con `npm install`.
2. Crea un archivo `.env` en la raíz con las credenciales de MySQL, un `JWT_SECRET`
   aleatorio de al menos 32 caracteres y `PORT`.
3. Opcionalmente, define `CORS_ORIGINS` con los orígenes permitidos separados
   por coma. En desarrollo se permiten `http://localhost:5173`,
   `http://127.0.0.1:5173`, `http://localhost:5500` y
   `http://127.0.0.1:5500`.

No uses el secreto JWT de ejemplo ni lo guardes en el repositorio. Genera uno
con `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

Variables esperadas en `.env`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=biblioteca_villa
JWT_SECRET=reemplazar_por_un_secreto_aleatorio_de_32_caracteres_o_mas
PORT=3001
CORS_ORIGINS=http://localhost:5500
```

## Ejecución

- Desarrollo: `npm run dev`
- Producción: `npm start`
- Pruebas: `npm test`

La API agrupa sus endpoints bajo el prefijo `/api/v1`.

## Swagger

- Interfaz pública: `/api-docs`
- Especificación OpenAPI: `/api-docs.json`

Los endpoints de negocio protegidos se pueden probar desde Swagger con el
token Bearer obtenido al iniciar sesión.

## Autenticación

| Método | Ruta | Acceso | Acción |
| --- | --- | --- | --- |
| GET | `/api/v1/auth` | Público | Lista rutas de autenticación |
| POST | `/api/v1/auth/register` | Público | Registra un cliente regular e inicia sesión |
| POST | `/api/v1/auth/login` | Público | Inicia sesión y devuelve JWT |
| GET | `/api/v1/auth/me` | JWT | Devuelve el perfil autenticado |
| POST | `/api/v1/auth/logout` | JWT | Confirma el cierre para que el frontend elimine el token |

El registro solo permite crear `CLIENTE_REGULAR`; no acepta `rol` ni
`estado_cuenta`. El login requiere `correo` y `contrasena`. La respuesta exitosa
contiene `data.token`, `data.token_type`, `data.expires_in` y `data.user`.
Envía el token en las rutas protegidas así:

```http
Authorization: Bearer <token>
```

Los tokens expiran en 8 horas. El logout no revoca el JWT en el servidor: el
frontend debe eliminarlo de su almacenamiento y volver a iniciar sesión cuando
expire.

### Crear el primer administrador

El registro público no puede otorgar roles privilegiados. Registra una cuenta
normal y luego promuévela manualmente desde una consola segura de MySQL:

```sql
UPDATE clientes
SET rol = 'ADMIN', estado_cuenta = 'ACTIVO'
WHERE correo = 'admin@tu-dominio.example'
  AND rol = 'CLIENTE_REGULAR';

SELECT id_cliente, correo, rol, estado_cuenta
FROM clientes
WHERE correo = 'admin@tu-dominio.example';
```

Después de iniciar sesión con esa cuenta, el administrador puede gestionar
cuentas de personal desde `/api/v1/empleados`. La API impide suspender o degradar
al último administrador activo.

## Acceso por rol

- Público: lectura de autores, libros, editoriales y géneros.
- `CLIENTE_REGULAR` y `CLIENTE_PREMIUM`: perfil propio y lectura de sus propios
  préstamos.
- `ADMIN` y `BIBLIOTECARIO`: gestión de catálogos, ventas y préstamos; pueden
  registrar una venta o un préstamo para un cliente elegido. El cajero o
  empleado que registra la operación se obtiene del JWT, no del cuerpo JSON.
- Solo `ADMIN`: lectura/gestión global de clientes y gestión de empleados y
  roles.

## Autores

CRUD disponible en `/api/v1/autores`. Los GET son públicos; POST, PUT, PATCH y
DELETE requieren `ADMIN` o `BIBLIOTECARIO`. El campo de creación/actualización
es `nombre_autor` (texto de 1 a 150 caracteres). No se puede eliminar un autor
referenciado por libros.

## Empleados

`/api/v1/empleados` representa cuentas de la tabla `clientes` cuyo rol es
`ADMIN` o `BIBLIOTECARIO`; no hay una tabla de empleados separada. Todos sus
endpoints requieren `ADMIN`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/empleados` | Listar cuentas de personal |
| GET | `/api/v1/empleados/:id` | Consultar empleado |
| POST | `/api/v1/empleados` | Crear empleado; requiere `rol` `ADMIN` o `BIBLIOTECARIO` |
| PATCH | `/api/v1/empleados/:id` | Actualizar cuenta o cambiar rol |
| DELETE | `/api/v1/empleados/:id` | Suspender empleado; no borra el registro |

## Préstamos

| Método | Ruta | Acceso | Acción |
| --- | --- | --- | --- |
| GET | `/api/v1/prestamos?page=1&limit=50` | JWT | Lista préstamos; los clientes solo ven los propios |
| GET | `/api/v1/prestamos/:id` | JWT | Consulta préstamo; el cliente solo puede consultar el propio |
| POST | `/api/v1/prestamos` | `ADMIN`/`BIBLIOTECARIO` | Registra un préstamo para el cliente indicado |
| POST | `/api/v1/prestamos/:id/devolucion` | `ADMIN`/`BIBLIOTECARIO` | Registra la condición de todos los libros y actualiza stock |

Al crear un préstamo envía `id_cliente`, `fecha_devolucion_esperada` y
`libros`; `id_empleado_despacha` se toma del JWT. Para una devolución, envía
`libros` con cada `id_detalle_prestamo` y su `estado_libro_entrada`
(`NUEVO`, `BUENO`, `DESGASTADO`, `DAÑADO` o `PERDIDO`). Deben enviarse todos
los detalles pendientes. Los ejemplares marcados `PERDIDO` no se agregan de
nuevo al stock. El esquema actual no define una tarifa de mora, por lo que la
devolución no calcula multas.

## Ventas

Ventas requieren `ADMIN` o `BIBLIOTECARIO`. Para crear una venta envía
`id_cliente` e `items`; cada item contiene `id_libro` y `cantidad`. No envíes
`id_empleado_cajero` ni precios: el empleado se toma del JWT y el servidor
calcula los precios. El listado acepta `page` y `limit` (máximo 100).

## Clientes

`/api/v1/clientes` es solo para `ADMIN`. El registro público se realiza en
`POST /api/v1/auth/register`; las cuentas creadas así no pueden escoger su rol.
Un administrador puede cambiar el rol de cliente a través de la gestión de
clientes o promover una cuenta a personal mediante `/api/v1/empleados`.

## Libros

El CRUD de libros está disponible en `/api/v1/libros`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/libros` | Listar libros |
| GET | `/api/v1/libros/:id` | Consultar un libro |
| POST | `/api/v1/libros` | Crear un libro |
| PUT | `/api/v1/libros/:id` | Reemplazar los campos obligatorios |
| PATCH | `/api/v1/libros/:id` | Actualizar campos enviados |
| DELETE | `/api/v1/libros/:id` | Eliminar un libro |

Para crear un libro se requieren `titulo`, `isbn`, `precio`, `id_autor`,
`id_editorial` e `id_genero`. `anio_publicacion`, `paginas`,
`idioma_escritura` y `stock` son opcionales; el stock predeterminado es cero.
El precio admite hasta dos decimales. Se valida que las referencias existan,
que el ISBN no esté duplicado y que no se eliminen libros asociados a ventas o
préstamos. Los errores de validación responden con HTTP 400, referencias
inexistentes con 422, libros no encontrados con 404 y conflictos con 409.
