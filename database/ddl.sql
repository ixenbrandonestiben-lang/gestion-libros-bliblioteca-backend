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