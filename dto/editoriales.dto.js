export default class EditorialessDTO {

    #id_editorial;
    #nombre_editorial;

    constructor({ id_editorial = null, nombre_editorial }) {

        this.#id_editorial = id_editorial;
        this.#nombre_editorial = nombre_editorial;
    }

    get id() {
        return this.#id_editorial;
    }

    get nombre_editorial() {
        return this.#nombre_editorial;
    }

    get data() {
        return {
            id: this.#id_editorial,
            nombre_autor: this.#nombre_editorial
        };
    }
}