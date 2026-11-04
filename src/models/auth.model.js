import pool from '../config/db.js';
import { ROLES } from '../constants/index.js';

const buscarPorCorreo = async (correo) => {
    const [filas] = await pool.execute(
        `SELECT id_cliente, dpi, nombre, apellido, telefono, correo,
                contrasena, rol, estado_cuenta, created_at, updated_at
         FROM clientes
         WHERE correo = ?`,
        [correo]
    );

    return filas[0] ?? null;
};

const buscarPorId = async (id) => {
    const [filas] = await pool.execute(
        `SELECT id_cliente, dpi, nombre, apellido, telefono, correo,
                rol, estado_cuenta, created_at, updated_at
         FROM clientes
         WHERE id_cliente = ?`,
        [id]
    );

    return filas[0] ?? null;
};

const crearCliente = async (cliente) => {
    const [resultado] = await pool.execute(
        `INSERT INTO clientes
            (dpi, nombre, apellido, telefono, correo, contrasena, rol, estado_cuenta)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
        [
            cliente.dpi,
            cliente.nombre,
            cliente.apellido,
            cliente.telefono ?? null,
            cliente.correo,
           cliente.contrasena,
           ROLES.CLIENTE_REGULAR
        ]
    );

    return resultado.insertId;
};

export default {
    buscarPorCorreo,
    buscarPorId,
    crearCliente
};
