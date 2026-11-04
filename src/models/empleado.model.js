import pool from '../config/db.js';
import { ROLES, ROLES_PERSONAL } from '../constants/index.js';

const rolesPersonalSql = ROLES_PERSONAL.map(() => '?').join(', ');

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

const listar = async () => {
    const [filas] = await pool.execute(
        `SELECT ${columnasPublicas}
         FROM clientes
        WHERE rol IN (${rolesPersonalSql})
        ORDER BY id_cliente`,
        ROLES_PERSONAL
    );

    return filas;
};

const buscarCuenta = async (id) => {
    const [filas] = await pool.execute(
        `SELECT ${columnasPublicas}
         FROM clientes
         WHERE id_cliente = ?`,
        [id]
    );

    return filas[0] ?? null;
};

const buscarEmpleado = async (id) => {
    const [filas] = await pool.execute(
        `SELECT ${columnasPublicas}
         FROM clientes
         WHERE id_cliente = ?
          AND rol IN (${rolesPersonalSql})`,
        [id, ...ROLES_PERSONAL]
    );

    return filas[0] ?? null;
};

const crear = async (datos) => {
    const [resultado] = await pool.execute(
        `INSERT INTO clientes
            (dpi, nombre, apellido, telefono, correo, contrasena, rol, estado_cuenta)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            datos.dpi,
            datos.nombre,
            datos.apellido,
            datos.telefono ?? null,
            datos.correo,
            datos.contrasena,
            datos.rol,
            datos.estado_cuenta ?? 'ACTIVO'
        ]
    );

    return resultado.insertId;
};

const actualizar = async (id, cambios) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();
        const [cuentas] = await conexion.execute(
            `SELECT id_cliente, rol, estado_cuenta
             FROM clientes
             WHERE id_cliente = ?
             FOR UPDATE`,
            [id]
        );
        const cuenta = cuentas[0];

        if (!cuenta) {
            await conexion.rollback();
            return { updated: false };
        }

        const [administradores] = await conexion.execute(
            `SELECT id_cliente
             FROM clientes
            WHERE rol = ?
               AND estado_cuenta = 'ACTIVO'
            FOR UPDATE`,
            [ROLES.ADMIN]
        );
        const quedaAdministradorActivo = (
            (cambios.rol ?? cuenta.rol) === ROLES.ADMIN
            && (cambios.estado_cuenta ?? cuenta.estado_cuenta) === 'ACTIVO'
        );

        if (
            cuenta.rol === ROLES.ADMIN
            && cuenta.estado_cuenta === 'ACTIVO'
            && !quedaAdministradorActivo
            && administradores.length <= 1
        ) {
            await conexion.rollback();
            return { lastAdmin: true };
        }

        const columnasPermitidas = new Set([
            'dpi',
            'nombre',
            'apellido',
            'telefono',
            'correo',
            'contrasena',
            'rol',
            'estado_cuenta'
        ]);
        const entradas = Object.entries(cambios).filter(([campo]) => (
            columnasPermitidas.has(campo)
        ));

        if (entradas.length > 0) {
            const asignaciones = entradas
                .map(([campo]) => `${campo} = ?`)
                .join(', ');
            const valores = entradas.map(([, valor]) => valor);
            await conexion.execute(
                `UPDATE clientes SET ${asignaciones} WHERE id_cliente = ?`,
                [...valores, id]
            );
        }

        await conexion.commit();
        return { updated: true };
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};

export default {
    listar,
    buscarCuenta,
    buscarEmpleado,
    crear,
    actualizar
};
