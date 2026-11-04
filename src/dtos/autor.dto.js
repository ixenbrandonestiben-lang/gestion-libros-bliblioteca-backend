export default class AutorDTO {
    #idAutor;
    #nombreAutor;

    constructor({ id_autor = null, nombre_autor }) {
        this.#idAutor = id_autor;
        this.#nombreAutor = nombre_autor;
    }

    static desdeEntrada(datos) {
        if (typeof datos?.nombre_autor !== 'string') {
            throw new TypeError('nombre_autor debe ser texto');
        }

        return new AutorDTO({
            nombre_autor: datos.nombre_autor.trim()
        });
    }

    static desdeRegistro(registro) {
        return new AutorDTO({
            id_autor: registro.id_autor,
            nombre_autor: registro.nombre_autor
        });
    }

    get id_autor() {
        return this.#idAutor;
    }

    get nombre_autor() {
        return this.#nombreAutor;
    }

    get datos() {
        return {
            id_autor: this.#idAutor,
            nombre_autor: this.#nombreAutor
        };
    }
}
