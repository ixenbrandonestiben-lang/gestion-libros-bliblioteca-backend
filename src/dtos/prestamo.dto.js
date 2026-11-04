export default class PrestamoDTO {
    static desdeRegistro(registro) {
        return {
            id_prestamo: registro.id_prestamo,
            id_cliente: registro.id_cliente,
            fecha_prestamo: registro.fecha_prestamo,
            fecha_devolucion_esperada: registro.fecha_devolucion_esperada,
            fecha_devolucion_real: registro.fecha_devolucion_real,
            estado_prestamo: registro.estado_prestamo,
            multa_acumulada: registro.multa_acumulada,
            id_empleado_despacha: registro.id_empleado_despacha,
            created_at: registro.created_at,
            libros: registro.libros.map((libro) => ({
                id_detalle_prestamo: libro.id_detalle_prestamo,
                id_libro: libro.id_libro,
                estado_libro_salida: libro.estado_libro_salida,
                estado_libro_entrada: libro.estado_libro_entrada
            }))
        };
    }
}