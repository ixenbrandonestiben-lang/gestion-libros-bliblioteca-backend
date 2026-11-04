export default class EditorialDTO {
    static desdeRegistro(registro) {
        return {
            id_editorial: registro.id_editorial,
            nombre_editorial: registro.nombre_editorial,
            created_at: registro.created_at
        };
    }
}
