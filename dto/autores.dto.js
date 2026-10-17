export default class AutoresDTO {

    #id_autor;
    #nombre_autor;

    constructor({ id_autor = null, nombre_autor }) {

        this.#id_autor = id_autor;
        this.#nombre_autor = nombre_autor;
    }

    get id() {
        return this.#id_autor;
    }

    get nombre_autor() {
        return this.#nombre_autor;
    }

    get data() {
        return {
            id: this.#id_autor,
            nombre_autor: this.#nombre_autor
        };
    }
}