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

## Géneros literarios

El CRUD de géneros literarios está disponible en
`/api/v1/generos-literarios`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/generos-literarios` | Listar géneros |
| GET | `/api/v1/generos-literarios/:id` | Consultar un género |
| POST | `/api/v1/generos-literarios` | Crear un género |
| PUT/PATCH | `/api/v1/generos-literarios/:id` | Actualizar el nombre |
| DELETE | `/api/v1/generos-literarios/:id` | Eliminar un género |

El cuerpo de creación y actualización acepta únicamente `nombre_genero`, texto
de entre 3 y 100 caracteres. Los datos inválidos responden con HTTP 400, los
géneros inexistentes con 404 y los géneros asociados a libros no se pueden
eliminar (HTTP 409).
