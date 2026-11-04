const camposPublicos = [
    'id_cliente',
    'dpi',
    'nombre',
    'apellido',
    'telefono',
    'correo',
    'rol',
    'estado_cuenta',
    'created_at',
    'updated_at'
];

export default class ClienteDTO {
    static desdeRegistro(registro) {
        return Object.fromEntries(
            camposPublicos
                .filter((campo) => registro[campo] !== undefined)
                .map((campo) => [campo, registro[campo]])
        );
    }
}
