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

## POS y consultas de ventas

`POST /api/v1/ventas` registra una venta; `GET /api/v1/ventas` consulta el
historial paginado y `GET /api/v1/ventas/:id` recupera una venta con su
detalle histórico. La creación recibe `id_cliente`, `id_empleado_cajero` y
`items`, un arreglo de `{ "id_libro": 1, "cantidad": 2 }`. El cajero debe
pertenecer al rol `ADMIN` o `BIBLIOTECARIO` y tener cuenta activa.

El servidor lee el precio actual de cada libro de la base de datos; no acepta
precios ni totales del cliente. Guarda el precio por unidad en
`precio_unitario_historico`, calcula subtotales y total con `DECIMAL` en MySQL,
y descuenta stock en la misma transacción. Si algún artículo no existe o no
tiene stock suficiente, no se registra parcialmente la venta. El historial
incluye el precio histórico y los subtotales, aunque luego cambie el precio del
catálogo. `page` (predeterminado 1) y `limit` (predeterminado 50, máximo 100)
permiten paginar el listado.
