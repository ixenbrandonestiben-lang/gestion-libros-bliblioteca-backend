export default class GeneroLiterarioDTO {
    static desdeRegistro(registro) {
        return {
            id_genero: registro.id_genero,
            nombre_genero: registro.nombre_genero,
            created_at: registro.created_at
        };
    }
}
