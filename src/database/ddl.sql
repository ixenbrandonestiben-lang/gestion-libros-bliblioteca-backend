CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

-- 1. CATEGORÍAS (NUEVA - mejor integridad que campo de texto)
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. AUTORES (simplificado)
CREATE TABLE IF NOT EXISTS autores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    INDEX idx_autor_nombre (nombre, apellido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. EDITORIALES (simplificado)
CREATE TABLE IF NOT EXISTS editoriales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. LIBROS (con categoria_id como FK)
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    autor_id INT,
    editorial_id INT,
    categoria_id INT,
    ano_publicacion INT,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE SET NULL,
    FOREIGN KEY (editorial_id) REFERENCES editoriales(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_libro_titulo (titulo),
    INDEX idx_libro_isbn (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. CLIENTES (simplificado)
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150),
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    estado ENUM('activo', 'suspendido', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cliente_documento (numero_documento),
    INDEX idx_cliente_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ADMINISTRADORES (simplificado)
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. PRÉSTAMOS (simplificado)
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    cliente_id INT NOT NULL,
    admin_id INT,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion_esperada DATE NOT NULL,
    fecha_devolucion_real DATE,
    estado ENUM('activo', 'devuelto', 'atrasado', 'perdido') DEFAULT 'activo',
    multa_aplicada DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES administradores(id) ON DELETE SET NULL,
    INDEX idx_prestamo_cliente (cliente_id),
    INDEX idx_prestamo_libro (libro_id),
    INDEX idx_prestamo_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. VENTAS (simplificado)
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    cliente_id INT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    INDEX idx_venta_cliente (cliente_id),
    INDEX idx_venta_libro (libro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. EJEMPLARES (simplificado)
CREATE TABLE IF NOT EXISTS ejemplares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    estado ENUM('disponible', 'prestado', 'danado', 'perdido') DEFAULT 'disponible',
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    INDEX idx_ejemplar_codigo (codigo_barras),
    INDEX idx_ejemplar_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. LIBRO_AUTOR (relación M:N)
CREATE TABLE IF NOT EXISTS libro_autor (
    libro_id INT NOT NULL,
    autor_id INT NOT NULL,
    PRIMARY KEY (libro_id, autor_id),
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;