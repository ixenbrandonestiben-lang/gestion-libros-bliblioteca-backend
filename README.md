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
