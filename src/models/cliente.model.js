import pool from '../config/db.js';
import { ROLES } from '../constants/index.js';

const columnasPublicas = `
    id_cliente,
    dpi,
    nombre,
    apellido,
    telefono,
    correo,
    rol,
    estado_cuenta,
    created_at,
    updated_at
`;

const columnasActualizables = new Set([
    'dpi',
    'nombre',
    'apellido',
    'telefono',
    'correo',
    'contrasena',
    'rol',
    'estado_cuenta'
]);

const listar = async () => {
    const [filas] = await pool.execute(
        `SELECT ${columnasPublicas} FROM clientes ORDER BY id_cliente`
    );

    return filas;
};

const buscarPorId = async (id) => {
    const [filas] = await pool.execute(
        `SELECT ${columnasPublicas} FROM clientes WHERE id_cliente = ?`,
        [id]
    );

    return filas[0] ?? null;
};

const crear = async (cliente) => {
    const {
        dpi,
        nombre,
        apellido,
        telefono = null,
        correo,
        contrasena,
        rol = ROLES.CLIENTE_REGULAR,
        estado_cuenta = 'ACTIVO'
    } = cliente;

    const [resultado] = await pool.execute(
        `INSERT INTO clientes
            (dpi, nombre, apellido, telefono, correo, contrasena, rol, estado_cuenta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [dpi, nombre, apellido, telefono, correo, contrasena, rol, estado_cuenta]
    );

    return resultado.insertId;
};

const actualizar = async (id, cambios) => {
    const entradas = Object.entries(cambios).filter(([columna]) =>
        columnasActualizables.has(columna)
    );

    if (entradas.length === 0) {
        return false;
    }

    const asignaciones = entradas.map(([columna]) => `${columna} = ?`).join(', ');
    const valores = entradas.map(([, valor]) => valor);
    const [resultado] = await pool.execute(
        `UPDATE clientes SET ${asignaciones} WHERE id_cliente = ?`,
        [...valores, id]
    );

    return resultado.affectedRows > 0;
};

const eliminar = async (id) => {
    const [resultado] = await pool.execute(
        'DELETE FROM clientes WHERE id_cliente = ?',
        [id]
    );

    return resultado.affectedRows > 0;
};

export default {
    listar,
    buscarPorId,
    crear,
    actualizar,
    eliminar
};