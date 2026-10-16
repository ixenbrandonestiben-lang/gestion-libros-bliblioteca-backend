export default class autoresDTO {
    #nombre_autor;

    constructor(data){
        this.#nombre_autor = nombre_autor;
    }

    get nombre_autor(){return this.#nombre_autor}


    get data(){
        return{
            nombre_autor: this.#nombre_autor
        }
    }
}