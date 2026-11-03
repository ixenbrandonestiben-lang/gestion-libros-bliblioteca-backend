# Biblioteca Villa API

API REST para la gestión de la biblioteca, organizada por capas: rutas,
controladores, servicios, modelos y middleware.

## Requisitos

- Node.js
- MySQL

## Configuración

1. Instala las dependencias con `npm install`.
2. Copia `.env.example` a `.env` y configura la conexión a MySQL y un valor
   seguro para `JWT_SECRET`.
3. Inicializa la base de datos usando el esquema existente en
   `database/ddl.sql`.

## Ejecución

- Desarrollo: `npm run dev`
- Producción: `npm start`
- Pruebas: `npm test`

El servidor usa `PORT` y, por compatibilidad con la configuración existente,
`SERVER_PORT` como alternativa.

## Estructura

La aplicación se inicia en `src/server.js`, configura Express en `src/app.js`
y organiza configuración, rutas, controladores, modelos, servicios,
validadores y middleware dentro de `src/`. Los módulos de funcionalidad se
preparan como estructura; sus reglas y endpoints se implementarán paso a paso.
