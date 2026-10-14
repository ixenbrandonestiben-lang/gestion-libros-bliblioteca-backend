CREATE TABLE IF NOT EXISTS autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    nacionalidad VARCHAR(100),
    fecha_nacimiento DATE,
    biografia TEXT,
    INDEX idx_autor_nombre (nombre, apellido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS editoriales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    pais VARCHAR(100),
    sitio_web VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    ano_publicacion INT,
    editorial_id INT,
    idioma VARCHAR(50) DEFAULT 'Español',
    numero_paginas INT,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (editorial_id) REFERENCES editoriales(id) ON DELETE SET NULL,
    INDEX idx_libro_titulo (titulo),
    INDEX idx_libro_isbn (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS libro_autor (
    libro_id INT NOT NULL,
    autor_id INT NOT NULL,
    orden INT DEFAULT 1,  -- Para autor principal vs coautor
    PRIMARY KEY (libro_id, autor_id),
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS libro_categoria (
    libro_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (libro_id, categoria_id),
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ejemplares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    ubicacion VARCHAR(100),       -- Estante, sala, sección
    estado ENUM('disponible', 'prestado', 'reservado', 'danado', 'perdido', 'mantenimiento') 
        DEFAULT 'disponible',
    fecha_adquisicion DATE,
    observaciones TEXT,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    INDEX idx_ejemplar_codigo (codigo_barras),
    INDEX idx_ejemplar_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tipos_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,   -- Estudiante, Docente, Externo, VIP
    dias_prestamo INT NOT NULL DEFAULT 7,
    max_prestamos INT NOT NULL DEFAULT 3,
    multa_diaria DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('DNI', 'INE', 'Pasaporte', 'Otro') DEFAULT 'DNI',
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    tipo_cliente_id INT NOT NULL DEFAULT 1,
    estado ENUM('activo', 'suspendido', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_cliente_id) REFERENCES tipos_cliente(id) ON DELETE RESTRICT,
    INDEX idx_cliente_documento (numero_documento),
    INDEX idx_cliente_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,  -- SuperAdmin, Bibliotecario, Auxiliar
    descripcion TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(200),
    correo VARCHAR(255) UNIQUE,
    rol_id INT NOT NULL DEFAULT 1,
    ultimo_acceso TIMESTAMP NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ejemplar_id INT NOT NULL,          -- Antes era libro_id
    cliente_id INT NOT NULL,
    admin_id INT,                      -- Quién registró el préstamo
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion_esperada DATE NOT NULL,  -- NUEVO: para calcular atrasos
    fecha_devolucion_real DATE,
    estado ENUM('activo', 'devuelto', 'atrasado', 'perdido') DEFAULT 'activo',
    observaciones TEXT,
    FOREIGN KEY (ejemplar_id) REFERENCES ejemplares(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES administradores(id) ON DELETE SET NULL,
    INDEX idx_prestamo_cliente (cliente_id),
    INDEX idx_prestamo_ejemplar (ejemplar_id),
    INDEX idx_prestamo_estado (estado),
    INDEX idx_prestamo_fecha_dev (fecha_devolucion_esperada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devoluciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id INT NOT NULL UNIQUE,   -- Un préstamo = una devolución
    admin_id INT,                      -- Quién recibió la devolución
    fecha_devolucion DATE NOT NULL,
    condicion_libro ENUM('buen_estado', 'danado_leve', 'danado_grave', 'perdido') 
        DEFAULT 'buen_estado',
    dias_atraso INT DEFAULT 0,
    multa_aplicada DECIMAL(10, 2) DEFAULT 0.00,
    observaciones TEXT,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES administradores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS multas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    prestamo_id INT,
    devolucion_id INT,
    monto DECIMAL(10, 2) NOT NULL,
    motivo VARCHAR(255) NOT NULL,      -- Atraso, daño, pérdida
    estado ENUM('pendiente', 'pagada', 'condonada') DEFAULT 'pendiente',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE SET NULL,
    FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id) ON DELETE SET NULL,
    INDEX idx_multa_cliente (cliente_id),
    INDEX idx_multa_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    cliente_id INT NOT NULL,
    admin_id INT,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATE NOT NULL,    -- La reserva expira si no se recoge
    estado ENUM('activa', 'cumplida', 'cancelada', 'expirada') DEFAULT 'activa',
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES administradores(id) ON DELETE SET NULL,
    INDEX idx_reserva_cliente (cliente_id),
    INDEX idx_reserva_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE  -- Efectivo, Tarjeta, Transferencia
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    admin_id INT,
    metodo_pago_id INT NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estado ENUM('completada', 'cancelada', 'devuelta') DEFAULT 'completada',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES administradores(id) ON DELETE SET NULL,
    FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id) ON DELETE RESTRICT,
    INDEX idx_venta_cliente (cliente_id),
    INDEX idx_venta_fecha (fecha_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detalle_venta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    libro_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE RESTRICT,
    INDEX idx_detalle_venta (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;