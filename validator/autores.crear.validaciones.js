import body from 'express-validator';

const validacionAtuores = [
    body('nombre_autor').notEmpty().withMessage('El nombre es un campo obligatorio').isString().withMessage('El nombre debe ser texto').trim()
];

export default validacionAtuores;