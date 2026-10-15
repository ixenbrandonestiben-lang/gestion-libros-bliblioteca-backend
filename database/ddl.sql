CREATE DATABASE IF NOT EXISTS biblioteca_villa;
USE biblioteca_villa;

CREATE TABLE autores(
    id_autor INT AUTO_INCREMENT PRIMARY KEY,
    nombre_autor VARCHAR(150) NOT NULL
);

CREATE TABLE editoriales(
    id_editorial INT AUTO_INCREMENT PRIMARY KEY,
    nombre_editorial VARACHAR(150) NOT NULL
);

CREATE TABLE generos_literarios (
    id_genero INT AUTO_INCREMENT PRIMARY KEY,
    nombre_genero VARCHAR(100) NOT NULL
);

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dpi VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(265),
    correo VARCHAR(250) NOT NULL,
    contrasena VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

CREATE TABLE libros (
    id_libro INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    abio_publicacion INT,
    paginas INT,
    idioma_escritura VARCHAR(50),
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    id_autor INT NOT NULL,
    id_editorial INT NOT NULL,
    id_genero INT NOT NULL,
    CONSTRAINT fk_libro_autor FOREIGN KEY (id_autor) REFERENCES autores(id_autor),
    CONSTRAINT fk_libro_editorial FOREIGN KEY (id_editorial) REFERENCES  editoriales(id_editorial),
    CONSTRAINT fk_libro_genero FOREIGN KEY (id_genero) REERENCES generos_literarios(id_genero)
);

