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

## Autores

- `GET /api/v1/autores`: lista autores.
- `GET /api/v1/autores/:id_autor`: consulta un autor.
- `POST /api/v1/autores`: crea un autor.
- `PUT /api/v1/autores/:id_autor`: actualiza el nombre de un autor.
- `DELETE /api/v1/autores/:id_autor`: elimina un autor si no tiene libros
  asociados.

Las operaciones de creación y actualización reciben JSON con
`nombre_autor` (entre 3 y 150 caracteres).
