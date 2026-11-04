CREATE DATABASE IF NOT EXISTS biblioteca_villa;
USE biblioteca_villa;

-- =========================================================================
-- 1. TABLAS DE CATÁLOGO (MAESTRAS)
-- =========================================================================

CREATE TABLE autores(
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_autor VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE editoriales(
    id_editorial INT AUTO_INCREMENT PRIMARY KEY,
    nombre_editorial VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generos_literarios (
    id_genero INT AUTO_INCREMENT PRIMARY KEY,
    nombre_genero VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. GESTIÓN DE USUARIOS Y AUTENTICACIÓN
-- =========================================================================

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(250) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Aumentado a 255 para soportar hashes seguros como bcrypt
    rol ENUM('ADMIN', 'BIBLIOTECARIO', 'CLIENTE_REGULAR', 'CLIENTE_PREMIUM') NOT NULL DEFAULT 'CLIENTE_REGULAR',
    estado_cuenta ENUM('ACTIVO', 'SUSPENDIDO', 'BLOQUEADO_POR_MORA') NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. INVENTARIO DE LIBROS
-- =========================================================================

CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    anio_publicacion INT,
    paginas INT,
    idioma_escritura VARCHAR(50),
    precio DECIMAL(10, 2) NOT NULL, -- Precio actual de venta al público
    stock INT NOT NULL DEFAULT 0,
    id_autor INT NOT NULL,
    id_editorial INT NOT NULL,
    id_genero INT NOT NULL,
    estado_disponibilidad ENUM('DISPONIBLE', 'AGOTADO', 'RESTRINGIDO') GENERATED ALWAYS AS (IF(stock > 0, 'DISPONIBLE', 'AGOTADO')) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_libro_autor FOREIGN KEY (id_autor) REFERENCES autores(id_autor) ON DELETE RESTRICT,
    CONSTRAINT fk_libro_editorial FOREIGN KEY (id_editorial) REFERENCES editoriales(id_editorial) ON DELETE RESTRICT,
    CONSTRAINT fk_libro_genero FOREIGN KEY (id_genero) REFERENCES generos_literarios(id_genero) ON DELETE RESTRICT
);

-- =========================================================================
-- 4. MÓDULO DE VENTAS (PUNTO DE VENTA - POS)
-- =========================================================================

CREATE TABLE ventas(
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    id_empleado_cajero INT NOT NULL, -- Registra qué usuario del sistema procesó la venta
    CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_venta_cajero FOREIGN KEY (id_empleado_cajero) REFERENCES clientes(id_cliente)
);

CREATE TABLE detalle_ventas(
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_libro INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario_historico DECIMAL(10, 2) NOT NULL, -- Evita que el total de la venta cambie si sube el precio del libro en el catálogo
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario_historico) STORED,
    CONSTRAINT fk_detalle_venta_master FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_libro FOREIGN KEY (id_libro) REFERENCES libros(id_libro)
);

-- =========================================================================
-- 5. MÓDULO DE PRÉSTAMOS Y DEVOLUCIONES
-- =========================================================================

CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion_esperada DATE NOT NULL,
    fecha_devolucion_real DATE NULL, -- CORREGIDO: Debe permitir NULL porque al iniciar el préstamo no se ha devuelto
    estado_prestamo ENUM('SOLICITADO', 'ACTIVO', 'DEVUELTO', 'VENCIDO', 'CON_MORA_PAGADA') NOT NULL DEFAULT 'ACTIVO',
    multa_acumulada DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Para el cobro de recargos por día de atraso
    id_empleado_despacha INT NOT NULL, -- Auditoría: Quién entregó el libro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prestamo_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_prestamo_empleado FOREIGN KEY (id_empleado_despacha) REFERENCES clientes(id_cliente)
);

CREATE TABLE detalle_prestamos (
    id_detalle_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_prestamo INT NOT NULL,
    id_libro INT NOT NULL,
    estado_libro_salida ENUM('NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO') NOT NULL DEFAULT 'BUENO',
    estado_libro_entrada ENUM('NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO', 'PERDIDO') NULL, -- Permite NULL hasta el retorno
    CONSTRAINT fk_detalle_prestamo_prestamo FOREIGN KEY (id_prestamo) REFERENCES prestamos(id_prestamo) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_prestamo_libro FOREIGN KEY (id_libro) REFERENCES libros(id_libro)
);
