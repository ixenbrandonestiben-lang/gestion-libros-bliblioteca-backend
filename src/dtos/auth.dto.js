const usuarioPublico = (usuario) => ({
    id_cliente: usuario.id_cliente,
    dpi: usuario.dpi,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono,
    correo: usuario.correo,
    rol: usuario.rol,
    estado_cuenta: usuario.estado_cuenta,
    created_at: usuario.created_at,
    updated_at: usuario.updated_at
});

export default class AuthDTO {
    static desdePerfil(usuario) {
        return usuarioPublico(usuario);
    }

    static desdeSesion(token, usuario) {
        return {
            token,
            token_type: 'Bearer',
            expires_in: 28800,
            user: usuarioPublico(usuario)
        };
    }
}