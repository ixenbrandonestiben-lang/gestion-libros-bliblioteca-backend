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

## Editoriales

El CRUD de editoriales está disponible en `/api/v1/editoriales`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/editoriales` | Listar editoriales |
| GET | `/api/v1/editoriales/:id` | Consultar una editorial |
| POST | `/api/v1/editoriales` | Crear una editorial |
| PUT/PATCH | `/api/v1/editoriales/:id` | Actualizar el nombre |
| DELETE | `/api/v1/editoriales/:id` | Eliminar una editorial |

El cuerpo de creación y actualización acepta únicamente `nombre_editorial`,
un texto obligatorio de hasta 150 caracteres. La validación responde con HTTP
400, los registros inexistentes con 404 y las editoriales relacionadas con
libros no se pueden eliminar (HTTP 409).
