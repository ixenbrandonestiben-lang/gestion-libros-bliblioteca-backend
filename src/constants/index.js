export const ROLES = Object.freeze({
    ADMIN: 'ADMIN',
    BIBLIOTECARIO: 'BIBLIOTECARIO',
    CLIENTE_REGULAR: 'CLIENTE_REGULAR',
    CLIENTE_PREMIUM: 'CLIENTE_PREMIUM'
});

export const ROLES_PERSONAL = Object.freeze([
    ROLES.ADMIN,
    ROLES.BIBLIOTECARIO
]);

export const ROLES_CLIENTE = Object.freeze([
    ROLES.CLIENTE_REGULAR,
    ROLES.CLIENTE_PREMIUM
]);

export const TODOS_LOS_ROLES = Object.freeze(Object.values(ROLES));