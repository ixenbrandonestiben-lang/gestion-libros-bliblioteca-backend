export default class GenerosLiterariosDTO {

    #id_genero;
    #nombre_genero;

    constructor({ id_genero = null, nombre_genero }) {

        this.#id_genero = id_genero;
        this.#nombre_genero = nombre_genero;
    }

    get id() {
        return this.#id_genero;
    }

    get nombre_genero() {
        return this.#nombre_genero;
    }

    get data() {
        return {
            id: this.#id_genero,
            nombre_genero: this.#nombre_genero
        };
    }
}