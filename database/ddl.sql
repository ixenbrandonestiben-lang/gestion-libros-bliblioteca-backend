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