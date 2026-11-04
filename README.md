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
