USE biblioteca_villa;

UPDATE clientes
SET contrasena = '$2b$12$2HI.79Ry02uu2JqcYsa5ouLXlyS6V8T7MHBWRP9XZ1Gze16UNuUdG'
WHERE correo = 'admin1@bibliotecavilla.gt'
  AND contrasena = '$2b$12$LJ3m4ys3Lg0kVvQ6Z7w8eOqR9tY2uI5oP8aSdF3gH7jK1lM9nBcDe';

UPDATE clientes
SET contrasena = '$2b$12$znie1G23QwtAs.KdANT4negVWhf0eo3FdBMAAwpPLvzuyWn3U6MXC'
WHERE correo = 'admin2@bibliotecavilla.gt'
  AND contrasena = '$2b$12$Xy9Za8b7C6d5E4f3G2h1I0jK9lM8n7O6p5Q4r3S2t1U0v9W8x7Yz';

UPDATE clientes
SET contrasena = '$2b$12$gnKTzWbjGrJ8UAcT3Zo/TuuAcakKFj/DdpNkR6OF9fLHlz1pmTDXm'
WHERE correo IN (
    'bibliotecario1@bibliotecavilla.gt',
    'bibliotecario2@bibliotecavilla.gt',
    'roberto.castillo@gmail.com',
    'sofia.hdz@gmail.com',
    'luis.gomez@outlook.com',
    'paty.vasquez@yahoo.com',
    'miguel.sr@gmail.com',
    'elena.mc@gmail.com',
    'fernando.reyes@outlook.com',
    'lucia.dp@gmail.com',
    'andres.jv@gmail.com',
    'valeria.om@gmail.com',
    'ricardo.fc@gmail.com'
)
  AND contrasena = '$2b$12$Kp8qR7s6T5u4V3w2X1y0Z9a8B7c6D5e4F3g2H1i0J9k8L7m6N5o4P';
