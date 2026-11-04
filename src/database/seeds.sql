-- =========================================================================
-- DATOS SEMILLA PARA BIBLIOTECA_VILLA
-- Generado: Jueves, 05 de Noviembre de 2026
-- =========================================================================

USE biblioteca_villa;

-- =========================================================================
-- 1. CATÁLOGOS MAESTROS
-- =========================================================================

-- AUTORES (15 registros)
INSERT INTO autores (nombre_autor) VALUES
('Gabriel García Márquez'),
('Jorge Luis Borges'),
('Isabel Allende'),
('Mario Vargas Llosa'),
('Julio Cortázar'),
('Pablo Neruda'),
('Octavio Paz'),
('Laura Esquivel'),
('Carlos Ruiz Zafón'),
('J.K. Rowling'),
('George R.R. Martin'),
('Stephen King'),
('Haruki Murakami'),
('Umberto Eco'),
('Dan Brown');

-- EDITORIALES (12 registros)
INSERT INTO editoriales (nombre_editorial) VALUES
('Editorial Planeta'),
('Alfaguara'),
('Salamandra'),
('Anagrama'),
('Penguin Random House'),
('Editorial Sudamericana'),
('Seix Barral'),
('Tusquets Editores'),
('Ediciones Destino'),
('RBA Libros'),
('Siruela'),
('Acantilado');

-- GÉNEROS LITERARIOS (12 registros)
INSERT INTO generos_literarios (nombre_genero) VALUES
('Realismo Mágico'),
('Novela Histórica'),
('Fantasía'),
('Ciencia Ficción'),
('Terror'),
('Misterio'),
('Romance'),
('Poesía'),
('Ensayo'),
('Thriller'),
('Literatura Juvenil'),
('Clásico Universal');

-- =========================================================================
-- 2. CLIENTES (15 registros - INCLUYENDO 2 ADMINISTRADORES)
-- =========================================================================
-- NOTA: Las contraseñas están hasheadas con bcrypt; son credenciales solo para desarrollo.
-- Contraseñas en texto plano para pruebas:
--   admin123 -> hash bcrypt válido
--   admin456 -> hash bcrypt válido
--   cliente123 -> hash bcrypt válido

INSERT INTO clientes (dpi, nombre, apellido, telefono, correo, contrasena, rol, estado_cuenta) VALUES
-- >>> ADMINISTRADORES <<<
('1234567890101', 'Carlos', 'Mendoza Rivera', '5555-1001', 'admin1@bibliotecavilla.gt', 
 '$2b$12$2HI.79Ry02uu2JqcYsa5ouLXlyS6V8T7MHBWRP9XZ1Gze16UNuUdG', 'ADMIN', 'ACTIVO'),
('9876543210101', 'María', 'Fernández López', '5555-1002', 'admin2@bibliotecavilla.gt', 
 '$2b$12$znie1G23QwtAs.KdANT4negVWhf0eo3FdBMAAwpPLvzuyWn3U6MXC', 'ADMIN', 'ACTIVO'),

-- BIBLIOTECARIOS
('1122334450101', 'Juan', 'Pérez García', '5555-2001', 'bibliotecario1@bibliotecavilla.gt', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'BIBLIOTECARIO', 'ACTIVO'),
('2233445560101', 'Ana', 'Ramírez Solís', '5555-2002', 'bibliotecario2@bibliotecavilla.gt', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'BIBLIOTECARIO', 'ACTIVO'),

-- CLIENTES PREMIUM
('3344556670101', 'Roberto', 'Castillo Morales', '5555-3001', 'roberto.castillo@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_PREMIUM', 'ACTIVO'),
('4455667780101', 'Sofía', 'Hernández Díaz', '5555-3002', 'sofia.hdz@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_PREMIUM', 'ACTIVO'),
('5566778890101', 'Luis', 'Gómez Torres', '5555-3003', 'luis.gomez@outlook.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_PREMIUM', 'ACTIVO'),

-- CLIENTES REGULARES
('6677889900101', 'Patricia', 'Vásquez Luna', '5555-4001', 'paty.vasquez@yahoo.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO'),
('7788990010101', 'Miguel', 'Sánchez Rivas', '5555-4002', 'miguel.sr@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO'),
('8899001120101', 'Elena', 'Morales Cruz', '5555-4003', 'elena.mc@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO'),
('9900112230101', 'Fernando', 'Reyes Aguilar', '5555-4004', 'fernando.reyes@outlook.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'SUSPENDIDO'),
('1011223340101', 'Lucía', 'Domínguez Paredes', '5555-4005', 'lucia.dp@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO'),
('2122334450101', 'Andrés', 'Jiménez Vega', '5555-4006', 'andres.jv@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'BLOQUEADO_POR_MORA'),
('3233445560101', 'Valeria', 'Ortiz Méndez', '5555-4007', 'valeria.om@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO'),
('4344556670101', 'Ricardo', 'Flores Castillo', '5555-4008', 'ricardo.fc@gmail.com', 
 '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm', 'CLIENTE_REGULAR', 'ACTIVO');

-- =========================================================================
-- 3. LIBROS (18 registros)
-- =========================================================================
-- NOTA: estado_disponibilidad es GENERATED ALWAYS, NO se incluye en el INSERT

INSERT INTO libros (titulo, isbn, anio_publicacion, paginas, idioma_escritura, precio, stock, id_autor, id_editorial, id_genero) VALUES
('Cien años de soledad', '978-84-376-0494-9', 1967, 471, 'Español', 185.00, 15, 1, 1, 1),
('El Aleph', '978-950-872-101-2', 1949, 156, 'Español', 120.00, 8, 2, 6, 12),
('La casa de los espíritus', '978-84-01-45231-0', 1982, 433, 'Español', 165.00, 12, 3, 2, 1),
('Conversación en La Catedral', '978-84-204-8134-5', 1969, 612, 'Español', 210.00, 5, 4, 2, 2),
('Rayuela', '978-950-872-102-9', 1963, 600, 'Español', 175.00, 0, 5, 6, 12),
('Veinte poemas de amor', '978-956-16-0345-7', 1924, 96, 'Español', 95.00, 20, 6, 1, 8),
('El laberinto de la soledad', '978-968-16-0123-4', 1950, 320, 'Español', 145.00, 7, 7, 3, 9),
('Como agua para chocolate', '978-968-411-123-7', 1989, 246, 'Español', 135.00, 10, 8, 4, 7),
('La sombra del viento', '978-84-08-06456-8', 2001, 576, 'Español', 195.00, 18, 9, 7, 6),
('Harry Potter y la piedra filosofal', '978-84-9838-123-4', 1997, 256, 'Español', 155.00, 25, 10, 5, 11),
('Juego de tronos', '978-84-96208-123-5', 1996, 864, 'Español', 245.00, 9, 11, 5, 3),
('It', '978-84-01-45678-9', 1986, 1216, 'Español', 280.00, 6, 12, 2, 5),
('Tokio Blues', '978-84-8383-123-6', 1987, 400, 'Español', 165.00, 11, 13, 10, 7),
('El nombre de la rosa', '978-84-7423-123-7', 1980, 704, 'Español', 225.00, 4, 14, 11, 6),
('El código Da Vinci', '978-84-08-01234-8', 2003, 688, 'Español', 215.00, 14, 15, 9, 10),
('Crónica de una muerte anunciada', '978-84-376-0495-6', 1981, 136, 'Español', 110.00, 0, 1, 1, 1),
('Ficciones', '978-950-872-103-6', 1944, 176, 'Español', 125.00, 13, 2, 6, 12),
('El amor en los tiempos del cólera', '978-84-376-0496-3', 1985, 448, 'Español', 175.00, 16, 1, 1, 7);

-- =========================================================================
-- 4. VENTAS (12 registros)
-- =========================================================================
-- id_empleado_cajero: los administradores (1, 2) y bibliotecarios (3, 4) pueden procesar ventas

INSERT INTO ventas (id_cliente, fecha_venta, total, id_empleado_cajero) VALUES
(5, '2026-10-15 10:30:00', 340.00, 1),    -- Roberto compra 2 libros, atendido por Admin1
(6, '2026-10-18 14:22:00', 155.00, 3),    -- Sofía compra 1 libro, atendido por Bibliotecario1
(8, '2026-10-20 11:45:00', 430.00, 2),    -- Patricia compra varios, atendido por Admin2
(7, '2026-10-22 16:10:00', 245.00, 4),    -- Luis compra Juego de tronos
(9, '2026-10-25 09:15:00', 185.00, 1),    -- Miguel compra Cien años de soledad
(10, '2026-10-28 13:50:00', 320.00, 3),   -- Elena compra 2 libros
(5, '2026-10-30 15:30:00', 210.00, 2),    -- Roberto compra otro libro
(13, '2026-11-01 10:00:00', 135.00, 4),   -- Valeria compra 1 libro
(14, '2026-11-02 12:20:00', 280.00, 1),   -- Ricardo compra IT
(6, '2026-11-03 17:45:00', 195.00, 2),    -- Sofía compra La sombra del viento
(15, '2026-11-04 11:10:00', 165.00, 3),   -- Ricardo compra otro
(8, '2026-11-05 09:30:00', 360.00, 4);    -- Patricia compra hoy

-- =========================================================================
-- 5. DETALLE DE VENTAS (18 registros)
-- =========================================================================
-- NOTA: subtotal es GENERATED ALWAYS, NO se incluye en el INSERT

INSERT INTO detalle_ventas (id_venta, id_libro, cantidad, precio_unitario_historico) VALUES
-- Venta 1: Roberto - Total 340.00
(1, 1, 1, 185.00),   -- Cien años de soledad
(1, 4, 1, 155.00),   -- Harry Potter (precio histórico distinto al actual)

-- Venta 2: Sofía - Total 155.00
(2, 10, 1, 155.00),  -- Harry Potter

-- Venta 3: Patricia - Total 430.00
(3, 3, 1, 165.00),   -- La casa de los espíritus
(3, 9, 1, 195.00),   -- La sombra del viento
(3, 16, 1, 70.00),   -- Crónica (precio histórico)

-- Venta 4: Luis - Total 245.00
(4, 11, 1, 245.00),  -- Juego de tronos

-- Venta 5: Miguel - Total 185.00
(5, 1, 1, 185.00),   -- Cien años de soledad

-- Venta 6: Elena - Total 320.00
(6, 15, 1, 215.00),  -- El código Da Vinci
(6, 18, 1, 105.00),  -- El amor en los tiempos del cólera (histórico)

-- Venta 7: Roberto - Total 210.00
(7, 4, 1, 210.00),   -- Conversación en La Catedral

-- Venta 8: Valeria - Total 135.00
(8, 8, 1, 135.00),   -- Como agua para chocolate

-- Venta 9: Ricardo - Total 280.00
(9, 12, 1, 280.00),  -- IT

-- Venta 10: Sofía - Total 195.00
(10, 9, 1, 195.00),  -- La sombra del viento

-- Venta 11: Ricardo - Total 165.00
(11, 13, 1, 165.00), -- Tokio Blues

-- Venta 12: Patricia - Total 360.00
(12, 14, 1, 225.00), -- El nombre de la rosa
(12, 7, 1, 135.00);  -- El laberinto de la soledad (histórico)

-- =========================================================================
-- 6. PRÉSTAMOS (12 registros)
-- =========================================================================

INSERT INTO prestamos (id_cliente, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, estado_prestamo, multa_acumulada, id_empleado_despacha) VALUES
(5, '2026-10-01', '2026-10-15', '2026-10-14', 'DEVUELTO', 0.00, 3),
(6, '2026-10-05', '2026-10-19', '2026-10-22', 'CON_MORA_PAGADA', 15.00, 4),
(7, '2026-10-10', '2026-10-24', '2026-10-23', 'DEVUELTO', 0.00, 1),
(8, '2026-10-15', '2026-10-29', NULL, 'ACTIVO', 0.00, 2),
(9, '2026-10-20', '2026-11-03', NULL, 'ACTIVO', 0.00, 3),
(10, '2026-10-25', '2026-11-08', NULL, 'SOLICITADO', 0.00, 4),
(13, '2026-10-28', '2026-11-11', NULL, 'ACTIVO', 0.00, 1),
(14, '2026-11-01', '2026-11-15', NULL, 'ACTIVO', 0.00, 2),
(15, '2026-09-15', '2026-09-29', NULL, 'VENCIDO', 45.00, 3),
(5, '2026-11-02', '2026-11-16', NULL, 'ACTIVO', 0.00, 4),
(6, '2026-11-03', '2026-11-17', NULL, 'ACTIVO', 0.00, 1),
(7, '2026-11-04', '2026-11-18', NULL, 'SOLICITADO', 0.00, 2);

-- =========================================================================
-- 7. DETALLE DE PRÉSTAMOS (15 registros)
-- =========================================================================

INSERT INTO detalle_prestamos (id_prestamo, id_libro, estado_libro_salida, estado_libro_entrada) VALUES
-- Préstamo 1: Roberto - DEVUELTO
(1, 1, 'BUENO', 'BUENO'),
(1, 2, 'NUEVO', 'BUENO'),

-- Préstamo 2: Sofía - CON_MORA_PAGADA
(2, 3, 'BUENO', 'DESGASTADO'),

-- Préstamo 3: Luis - DEVUELTO
(3, 5, 'NUEVO', 'NUEVO'),
(3, 9, 'BUENO', 'BUENO'),

-- Préstamo 4: Patricia - ACTIVO (aún no devuelto)
(4, 10, 'NUEVO', NULL),
(4, 11, 'BUENO', NULL),

-- Préstamo 5: Miguel - ACTIVO
(5, 12, 'BUENO', NULL),

-- Préstamo 6: Elena - SOLICITADO
(6, 14, 'NUEVO', NULL),

-- Préstamo 7: Valeria - ACTIVO
(7, 15, 'BUENO', NULL),
(7, 18, 'BUENO', NULL),

-- Préstamo 8: Ricardo - ACTIVO
(8, 13, 'NUEVO', NULL),

-- Préstamo 9: Ricardo - VENCIDO
(9, 8, 'DESGASTADO', NULL),

-- Préstamo 10: Roberto - ACTIVO
(10, 17, 'NUEVO', NULL),

-- Préstamo 11: Sofía - ACTIVO
(11, 16, 'BUENO', NULL),

-- Préstamo 12: Luis - SOLICITADO
(12, 4, 'NUEVO', NULL);

-- =========================================================================
-- RESUMEN DE DATOS INSERTADOS
-- =========================================================================
-- autores:              15 registros
-- editoriales:          12 registros
-- generos_literarios:   12 registros
-- clientes:             15 registros (2 ADMIN, 2 BIBLIOTECARIO, 3 PREMIUM, 8 REGULAR)
-- libros:               18 registros
-- ventas:               12 registros
-- detalle_ventas:       18 registros
-- prestamos:            12 registros
-- detalle_prestamos:    15 registros
-- =========================================================================