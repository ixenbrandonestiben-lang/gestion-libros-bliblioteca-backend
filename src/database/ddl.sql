CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

-- 1. Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Libros
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    ano_publicacion INT,
    categoria_id INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_categoria (categoria_id)
);

-- 3. Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

-- 4. Administradores
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL
);

-- 5. Préstamos (Con Cascade para cumplir tu solicitud)
CREATE TABLE IF NOT EXISTS prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    cliente_id INT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE,
    estado ENUM('activo', 'devuelto', 'atrasado') DEFAULT 'activo',
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_prestamo_cliente (cliente_id),
    INDEX idx_prestamo_libro (libro_id)
);

-- 6. Devoluciones
CREATE TABLE IF NOT EXISTS devoluciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id INT NOT NULL,
    fecha_devolucion DATE NOT NULL,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE,
    INDEX idx_devolucion_prestamo (prestamo_id)
);

-- 7. Ventas (Con Cascade para cumplir tu solicitud)
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libro_id INT NOT NULL,
    cliente_id INT NOT NULL,
    fecha_venta DATE NOT NULL,
    cantidad INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE RESTRICT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_venta_cliente (cliente_id),
    INDEX idx_venta_libro (libro_id)
);