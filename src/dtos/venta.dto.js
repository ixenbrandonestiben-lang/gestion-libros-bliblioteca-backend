export default class VentaDTO {
    static desdeRegistro(registro) {
        return {
            id_venta: registro.id_venta,
            id_cliente: registro.id_cliente,
            fecha_venta: registro.fecha_venta,
            total: registro.total,
            id_empleado_cajero: registro.id_empleado_cajero,
            moneda: 'GTQ',
            detalles: registro.detalles.map((detalle) => ({
                id_detalle_venta: detalle.id_detalle_venta,
                id_libro: detalle.id_libro,
                titulo: detalle.titulo,
                cantidad: detalle.cantidad,
                precio_unitario_historico: detalle.precio_unitario_historico,
                subtotal: detalle.subtotal
            }))
        };
    }
}