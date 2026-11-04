const camposPublicos = [
    'id_libro',
    'titulo',
    'isbn',
    'anio_publicacion',
    'paginas',
    'idioma_escritura',
    'precio',
    'stock',
    'id_autor',
    'id_editorial',
    'id_genero',
    'estado_disponibilidad',
    'created_at',
    'updated_at'
];

export default class LibroDTO {
    static desdeRegistro(registro) {
        return Object.fromEntries(
            camposPublicos
                .filter((campo) => registro[campo] !== undefined)
                .map((campo) => [campo, registro[campo]])
        );
    }
}