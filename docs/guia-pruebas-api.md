# Guía para probar Biblioteca Villa API

Esta guía muestra cómo recorrer los endpoints de la API con ejemplos concretos desde PowerShell, Postman o Swagger UI.

## 1. Iniciar la API

Configura las variables de conexión a MySQL en `.env` según `src/config/db.js` y asegúrate de que la base de datos y sus tablas estén disponibles. Luego, desde la raíz del proyecto:

```powershell
npm install
npm run dev
```

La configuración del servidor usa el puerto `3000` si no se define `PORT` o `SERVER_PORT`.

```powershell
$BaseUrl = "http://localhost:3000"
$Api = "$BaseUrl/api/v1"
```

También puedes abrir `http://localhost:3000/api-docs` en el navegador. Swagger UI está publicado sin autenticación e incluye **Try it out**. La especificación OpenAPI está en `http://localhost:3000/api-docs.json`.

En Postman, crea una colección, usa `http://localhost:3000/api/v1` como base URL, selecciona **Body → raw → JSON** para solicitudes con cuerpo y agrega `Content-Type: application/json`.

## 2. Rutas generales

| Método | Ruta | Uso |
|---|---|---|
| GET | `/` | Redirige a `/api/v1`. |
| GET | `/api/v1` | Devuelve nombre, versión y enlaces a los recursos. |
| GET | `/api-docs` | Interfaz pública de Swagger UI. |
| GET | `/api-docs.json` | Documento OpenAPI en JSON. |

Ejemplo:

```powershell
Invoke-RestMethod "$Api"
```

## 3. Orden recomendado para probar

1. Crea una editorial y un género literario.
2. Crea un libro usando un autor existente en la base de datos, junto con los IDs de editorial y género obtenidos antes.
3. Usa clientes y libros existentes para probar préstamos y ventas.
4. Lista y consulta los registros creados; prueba actualización y eliminación al final.

**Datos que deben existir previamente:** la API no incluye rutas para crear autores ni empleados. Para crear libros, `id_autor` debe referenciar un autor existente. Para registrar una venta, `id_empleado_cajero` debe referenciar un cliente/empleado existente con rol `ADMIN` o `BIBLIOTECARIO` y cuenta `ACTIVO`. La ruta de clientes solo acepta los roles `CLIENTE_REGULAR` y `CLIENTE_PREMIUM`, por lo que un cajero con los roles requeridos debe estar precargado en la base de datos. Para préstamos, el cliente debe estar activo y los IDs de cliente, empleado y libros deben existir.

Los IDs de abajo se capturan de las respuestas cuando se crean registros. Para `autor` y `cajero`, reemplaza el ejemplo por IDs válidos de tu base de datos:

```powershell
$AutorId = 1
$CajeroId = 2
```

## 4. Editoriales

### Crear — `POST /api/v1/editoriales`

```powershell
$editorial = Invoke-RestMethod "$Api/editoriales" -Method Post `
  -ContentType "application/json" `
  -Body (@{ nombre_editorial = "Editorial de Prueba" } | ConvertTo-Json)
$EditorialId = $editorial.data.id_editorial
$EditorialId
```

`nombre_editorial` es obligatorio, texto no vacío, máximo 150 caracteres.

### Listar — `GET /api/v1/editoriales`

```powershell
Invoke-RestMethod "$Api/editoriales"
```

### Consultar por ID — `GET /api/v1/editoriales/{id}`

```powershell
Invoke-RestMethod "$Api/editoriales/$EditorialId"
```

### Actualizar — `PUT /api/v1/editoriales/{id}` o `PATCH /api/v1/editoriales/{id}`

Ambos métodos aceptan los mismos campos; envía un cuerpo JSON no vacío.

```powershell
Invoke-RestMethod "$Api/editoriales/$EditorialId" -Method Patch `
  -ContentType "application/json" `
  -Body (@{ nombre_editorial = "Editorial de Prueba Actualizada" } | ConvertTo-Json)
```

### Eliminar — `DELETE /api/v1/editoriales/{id}`

```powershell
Invoke-RestMethod "$Api/editoriales/$EditorialId" -Method Delete
```

No elimines la editorial mientras un libro la esté usando.

## 5. Géneros literarios

### Crear — `POST /api/v1/generos-literarios`

```powershell
$genero = Invoke-RestMethod "$Api/generos-literarios" -Method Post `
  -ContentType "application/json" `
  -Body (@{ nombre_genero = "Ciencia ficción" } | ConvertTo-Json)
$GeneroId = $genero.data.id_genero
$GeneroId
```

`nombre_genero` debe tener entre 3 y 100 caracteres.

### Listar y consultar

```powershell
Invoke-RestMethod "$Api/generos-literarios"
Invoke-RestMethod "$Api/generos-literarios/$GeneroId"
```

### Actualizar — `PUT` o `PATCH /api/v1/generos-literarios/{id}`

```powershell
Invoke-RestMethod "$Api/generos-literarios/$GeneroId" -Method Patch `
  -ContentType "application/json" `
  -Body (@{ nombre_genero = "Ficción especulativa" } | ConvertTo-Json)
```

### Eliminar — `DELETE /api/v1/generos-literarios/{id}`

```powershell
Invoke-RestMethod "$Api/generos-literarios/$GeneroId" -Method Delete
```

No elimines un género que esté referenciado por libros.

## 6. Clientes

### Crear — `POST /api/v1/clientes`

```powershell
$cliente = Invoke-RestMethod "$Api/clientes" -Method Post `
  -ContentType "application/json" `
  -Body (@{
    dpi = "PRUEBA-0001"
    nombre = "Ana"
    apellido = "López"
    telefono = "+502 5555-0101"
    correo = "ana.prueba@example.com"
    contrasena = "ClavePrueba123"
    rol = "CLIENTE_REGULAR"
    estado_cuenta = "ACTIVO"
  } | ConvertTo-Json)
$ClienteId = $cliente.data.id_cliente
$ClienteId
```

Obligatorios: `dpi` (máximo 20), `nombre` y `apellido` (máximo 100 cada uno), `correo` válido (máximo 250) y `contrasena` de 8 a 72 caracteres, máximo 72 bytes UTF-8. `telefono` es opcional; si se envía debe tener 7–20 caracteres válidos. `rol` solo admite `CLIENTE_REGULAR` o `CLIENTE_PREMIUM`. `estado_cuenta` admite `ACTIVO`, `SUSPENDIDO` o `BLOQUEADO_POR_MORA`. DPI y correo deben ser únicos.

### Listar y consultar

```powershell
Invoke-RestMethod "$Api/clientes"
Invoke-RestMethod "$Api/clientes/$ClienteId"
```

### Actualizar — `PUT` o `PATCH /api/v1/clientes/{id}`

Se permite enviar uno o más campos válidos; el cuerpo no puede estar vacío.

```powershell
Invoke-RestMethod "$Api/clientes/$ClienteId" -Method Patch `
  -ContentType "application/json" `
  -Body (@{ telefono = "+502 5555-0102" } | ConvertTo-Json)
```

### Eliminar — `DELETE /api/v1/clientes/{id}`

```powershell
Invoke-RestMethod "$Api/clientes/$ClienteId" -Method Delete
```

La eliminación puede ser rechazada si el cliente ya tiene ventas o préstamos relacionados.

## 7. Libros

### Crear — `POST /api/v1/libros`

`id_autor` debe existir en la base de datos. Editorial y género pueden ser los creados arriba.

```powershell
$libro = Invoke-RestMethod "$Api/libros" -Method Post `
  -ContentType "application/json" `
  -Body (@{
    titulo = "El viaje de prueba"
    isbn = "ISBN-PRUEBA-0001"
    anio_publicacion = 2024
    paginas = 240
    idioma_escritura = "Español"
    precio = 125.50
    stock = 10
    id_autor = $AutorId
    id_editorial = $EditorialId
    id_genero = $GeneroId
  } | ConvertTo-Json)
$LibroId = $libro.data.id_libro
$LibroId
```

Obligatorios: `titulo` (máximo 200), `isbn` (máximo 50), `precio` (0–99999999.99, hasta dos decimales) y los IDs positivos `id_autor`, `id_editorial` e `id_genero`. `anio_publicacion` (1–9999), `paginas`, `idioma_escritura` (máximo 50) y `stock` (entero desde 0) son opcionales. ISBN debe ser único.

### Listar y consultar

```powershell
Invoke-RestMethod "$Api/libros"
Invoke-RestMethod "$Api/libros/$LibroId"
```

### Reemplazar — `PUT /api/v1/libros/{id}`

`PUT` requiere todos los campos obligatorios de creación:

```powershell
Invoke-RestMethod "$Api/libros/$LibroId" -Method Put `
  -ContentType "application/json" `
  -Body (@{
    titulo = "El viaje de prueba, edición revisada"
    isbn = "ISBN-PRUEBA-0001"
    precio = 130.00
    id_autor = $AutorId
    id_editorial = $EditorialId
    id_genero = $GeneroId
    anio_publicacion = 2025
    paginas = 250
    idioma_escritura = "Español"
    stock = 10
  } | ConvertTo-Json)
```

### Actualizar parcialmente — `PATCH /api/v1/libros/{id}`

```powershell
Invoke-RestMethod "$Api/libros/$LibroId" -Method Patch `
  -ContentType "application/json" `
  -Body (@{ precio = 129.99; stock = 8 } | ConvertTo-Json)
```

### Eliminar — `DELETE /api/v1/libros/{id}`

```powershell
Invoke-RestMethod "$Api/libros/$LibroId" -Method Delete
```

Un libro asociado a ventas o préstamos no se puede eliminar.

## 8. Préstamos

### Registrar — `POST /api/v1/prestamos`

La fecha debe ser válida y futura, en formato `YYYY-MM-DD`. El cliente debe estar activo y debe haber existencias disponibles.

```powershell
$fechaDevolucion = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")

Invoke-RestMethod "$Api/prestamos" -Method Post `
  -ContentType "application/json" `
  -Body (@{
    id_cliente = $ClienteId
    id_empleado_despacha = $CajeroId
    fecha_devolucion_esperada = $fechaDevolucion
    libros = @(
      @{
        id_libro = $LibroId
        estado_libro_salida = "BUENO"
      }
    )
  } | ConvertTo-Json -Depth 5)
```

`libros` debe contener al menos un objeto con `id_libro` y, opcionalmente, `estado_libro_salida`: `NUEVO`, `BUENO`, `DESGASTADO` o `DAÑADO`. El préstamo descuenta existencias.

## 9. Ventas

### Registrar — `POST /api/v1/ventas`

El cajero debe existir, estar activo y tener rol `ADMIN` o `BIBLIOTECARIO`. El precio se calcula en el servidor: no lo incluyas en `items`.

```powershell
$venta = Invoke-RestMethod "$Api/ventas" -Method Post `
  -ContentType "application/json" `
  -Body (@{
    id_cliente = $ClienteId
    id_empleado_cajero = $CajeroId
    items = @(
      @{
        id_libro = $LibroId
        cantidad = 1
      }
    )
  } | ConvertTo-Json -Depth 5)
$VentaId = $venta.data.id_venta
$VentaId
```

`items` admite de 1 a 100 artículos. Cada `id_libro` debe aparecer una sola vez; para varias unidades aumenta `cantidad`. Ambos valores deben ser enteros positivos. La venta descuenta existencias.

### Listar — `GET /api/v1/ventas`

```powershell
Invoke-RestMethod "$Api/ventas"
Invoke-RestMethod "$Api/ventas?page=1&limit=10"
```

`page` debe ser entero positivo. `limit` admite enteros de 1 a 100; por defecto, el servicio usa 50. La respuesta incluye `data` y `pagination`.

### Consultar por ID — `GET /api/v1/ventas/{id}`

```powershell
Invoke-RestMethod "$Api/ventas/$VentaId"
```

## 10. Autenticación

La ruta `/api/v1/auth` está montada, pero actualmente no tiene endpoints implementados. No hay un endpoint de login ni se requiere token para las rutas documentadas.

## 11. Comprobar validaciones y errores

Prueba un cuerpo inválido para comprobar la respuesta de validación `400`:

```powershell
try {
  Invoke-RestMethod "$Api/editoriales" -Method Post `
    -ContentType "application/json" `
    -Body (@{ campo_inexistente = "no permitido" } | ConvertTo-Json)
} catch {
  $_.ErrorDetails.Message
}
```

La respuesta de validación tiene esta forma:

```json
{
  "status": "error",
  "message": "La solicitud contiene datos inválidos",
  "errors": [
    {
      "location": "body",
      "field": "nombre_editorial",
      "message": "El nombre de la editorial es obligatorio"
    }
  ]
}
```

Otros resultados posibles: `404` para IDs inexistentes, `409` para conflictos como duplicados o existencias insuficientes, y `422` cuando una referencia requerida no existe. No reutilices datos si obtienes un error: revisa primero el mensaje y los IDs enviados.

> **Precaución:** `POST`, `PUT`, `PATCH` y `DELETE` escriben en la base de datos; ventas y préstamos también modifican existencias. Usa datos de prueba y revisa las respuestas antes de continuar. La documentación y las rutas actuales no requieren autenticación.
