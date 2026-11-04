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

## Creación transaccional de préstamos

`POST /api/v1/prestamos` recibe `id_cliente`, `id_empleado_despacha`,
`fecha_devolucion_esperada` en formato `YYYY-MM-DD` y un arreglo no vacío
`libros` con `id_libro` y, opcionalmente, `estado_libro_salida`.

La creación bloquea las filas del cliente y de los libros, valida la cuenta,
la fecha y el stock, y registra el préstamo, sus detalles y la disminución de
stock dentro de una única transacción. Si el cliente tiene un préstamo activo
vencido sin devolución, la operación no se crea: el préstamo vencido se marca
`VENCIDO`, la cuenta se marca `BLOQUEADO_POR_MORA` y se responde HTTP 409. Un
cliente ya bloqueado o suspendido tampoco puede recibir préstamos. Cualquier
otro fallo durante la creación revierte todos los cambios de la transacción.
