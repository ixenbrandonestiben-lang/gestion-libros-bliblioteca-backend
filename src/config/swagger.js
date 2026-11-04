import {
    ROLES,
    ROLES_CLIENTE,
    ROLES_PERSONAL,
    TODOS_LOS_ROLES
} from '../constants/index.js';

const respuesta = (description, dataSchema = {}, extraProperties = {}) => ({
    description,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['success'] },
                    ...(dataSchema ? { data: dataSchema } : {}),
                    ...extraProperties
                },
                required: ['status']
            }
        }
    }
});

const errorResponse = (description) => ({
    description,
    content: {
        'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
        }
    }
});

const body = (schemaName) => ({
    required: true,
    content: {
        'application/json': {
            schema: { $ref: `#/components/schemas/${schemaName}` }
        }
    }
});

const idParameter = {
    name: 'id',
    in: 'path',
    required: true,
    description: 'Identificador entero positivo.',
    schema: { type: 'integer', minimum: 1, maximum: 2147483647 }
};

const operation = (summary, tags, successDescription, options = {}) => {
    const responses = {
        [options.status || 200]: respuesta(
            successDescription,
            options.dataSchema === undefined ? {} : options.dataSchema,
            options.responseProperties
        ),
        400: errorResponse('Solicitud inválida o parámetros con formato incorrecto.'),
        404: errorResponse('No se encontró el recurso solicitado.'),
        500: errorResponse('Error interno del servidor.')
    };
    if (options.protected) {
        responses[401] = errorResponse('Token Bearer faltante, inválido o expirado.');
        responses[403] = errorResponse('El usuario autenticado no tiene el rol requerido.');
    }

    return {
        summary,
        tags,
        ...(options.protected ? { security: [{ bearerAuth: [] }] } : {}),
        ...(options.description ? { description: options.description } : {}),
        ...(options.parameters ? { parameters: options.parameters } : {}),
        ...(options.requestBody ? { requestBody: options.requestBody } : {}),
        responses
    };
};

const crudPaths = ({
    path,
    tag,
    label,
    createSchema,
    updateSchema,
    replaceSchema,
    itemSchema = {},
    readProtected = false,
    writeProtected = true,
    includePut = true,
    readDescription,
    writeDescription,
    deleteDescription = `${label} eliminado correctamente.`
}) => {
    const collectionPath = `/${path}`;
    const itemPath = `${collectionPath}/{id}`;

    return {
        [collectionPath]: {
            get: operation(`Listar ${label}`, [tag], `Lista de ${label}.`, {
                protected: readProtected,
                description: readDescription,
                dataSchema: { type: 'array', items: itemSchema }
            }),
            post: operation(`Crear ${label}`, [tag], `${label} creado correctamente.`, {
                protected: writeProtected,
                description: writeDescription,
                status: 201,
                requestBody: body(createSchema),
                dataSchema: itemSchema
            })
        },
        [itemPath]: {
            parameters: [idParameter],
            get: operation(`Obtener ${label} por ID`, [tag], `${label} encontrado.`, {
                protected: readProtected,
                parameters: [idParameter],
                dataSchema: itemSchema
            }),
            ...(includePut ? {
                put: operation(`Reemplazar ${label}`, [tag], `${label} actualizado correctamente.`, {
                    protected: writeProtected,
                    description: writeDescription,
                    parameters: [idParameter],
                    requestBody: body(replaceSchema || updateSchema),
                    dataSchema: itemSchema
                })
            } : {}),
            patch: operation(`Actualizar ${label}`, [tag], `${label} actualizado correctamente.`, {
                protected: writeProtected,
                description: writeDescription,
                parameters: [idParameter],
                requestBody: body(updateSchema),
                dataSchema: itemSchema
            }),
            delete: operation(`Eliminar ${label}`, [tag], deleteDescription, {
                protected: writeProtected,
                description: writeDescription,
                dataSchema: null,
                responseProperties: {
                    message: { type: 'string', example: deleteDescription }
                }
            })
        }
    };
};

const schemas = {
    ErrorResponse: {
        type: 'object',
        properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            errors: {
                type: 'array',
                description: 'Errores de validación; presente en respuestas 400 de validación.',
                items: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', example: 'body' },
                        field: { type: 'string', example: 'nombre' },
                        message: { type: 'string' }
                    }
                }
            }
        },
        required: ['status', 'message']
    },
    AuthRegister: {
        type: 'object',
        additionalProperties: false,
        required: ['dpi', 'nombre', 'apellido', 'correo', 'contrasena'],
        properties: {
            dpi: { type: 'string', maxLength: 20 },
            nombre: { type: 'string', maxLength: 100 },
            apellido: { type: 'string', maxLength: 100 },
            telefono: { type: 'string', nullable: true, minLength: 7, maxLength: 20 },
            correo: { type: 'string', format: 'email', maxLength: 250 },
            contrasena: { type: 'string', format: 'password', minLength: 8, maxLength: 72 }
        }
    },
    AuthLogin: {
        type: 'object',
        additionalProperties: false,
        required: ['correo', 'contrasena'],
        properties: {
            correo: { type: 'string', format: 'email' },
            contrasena: { type: 'string', format: 'password', maxLength: 72 }
        }
    },
    AuthSession: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'integer', example: 28800 },
            user: { $ref: '#/components/schemas/Cliente' }
        }
    },
    AutorInput: {
        type: 'object',
        additionalProperties: false,
        required: ['nombre_autor'],
        properties: {
            nombre_autor: { type: 'string', minLength: 1, maxLength: 150 }
        }
    },
    EmpleadoCreate: {
        type: 'object',
        additionalProperties: false,
        required: ['dpi', 'nombre', 'apellido', 'correo', 'contrasena', 'rol'],
        properties: {
            dpi: { type: 'string', maxLength: 20 },
            nombre: { type: 'string', maxLength: 100 },
            apellido: { type: 'string', maxLength: 100 },
            telefono: { type: 'string', nullable: true, minLength: 7, maxLength: 20 },
            correo: { type: 'string', format: 'email', maxLength: 250 },
            contrasena: { type: 'string', format: 'password', minLength: 8, maxLength: 72 },
            rol: { type: 'string', enum: ROLES_PERSONAL },
            estado_cuenta: { type: 'string', enum: ['ACTIVO', 'SUSPENDIDO'] }
        }
    },
    EmpleadoUpdate: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
            dpi: { type: 'string', maxLength: 20 },
            nombre: { type: 'string', maxLength: 100 },
            apellido: { type: 'string', maxLength: 100 },
            telefono: { type: 'string', nullable: true, minLength: 7, maxLength: 20 },
            correo: { type: 'string', format: 'email', maxLength: 250 },
            contrasena: { type: 'string', format: 'password', minLength: 8, maxLength: 72 },
            rol: {
                type: 'string',
                enum: TODOS_LOS_ROLES
            },
            estado_cuenta: {
                type: 'string',
                enum: ['ACTIVO', 'SUSPENDIDO']
            }
        }
    },
    Cliente: {
        type: 'object',
        properties: {
            id_cliente: { type: 'integer' },
            dpi: { type: 'string' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            telefono: { type: 'string', nullable: true },
            correo: { type: 'string', format: 'email' },
            rol: {
                type: 'string',
                enum: TODOS_LOS_ROLES
            },
            estado_cuenta: {
                type: 'string',
                enum: ['ACTIVO', 'SUSPENDIDO', 'BLOQUEADO_POR_MORA']
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
        }
    },
    Empleado: { $ref: '#/components/schemas/Cliente' },
    Autor: {
        type: 'object',
        properties: {
            id_autor: { type: 'integer' },
            nombre_autor: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
        }
    },
    Editorial: {
        type: 'object',
        properties: {
            id_editorial: { type: 'integer' },
            nombre_editorial: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
        }
    },
    Genero: {
        type: 'object',
        properties: {
            id_genero: { type: 'integer' },
            nombre_genero: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
        }
    },
    Libro: {
        type: 'object',
        properties: {
            id_libro: { type: 'integer' },
            titulo: { type: 'string' },
            isbn: { type: 'string' },
            anio_publicacion: { type: 'integer', nullable: true },
            paginas: { type: 'integer', nullable: true },
            idioma_escritura: { type: 'string', nullable: true },
            precio: { type: 'number' },
            stock: { type: 'integer' },
            id_autor: { type: 'integer' },
            id_editorial: { type: 'integer' },
            id_genero: { type: 'integer' },
            estado_disponibilidad: {
                type: 'string',
                enum: ['DISPONIBLE', 'AGOTADO', 'RESTRINGIDO']
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
        }
    },
    ClienteCreate: {
        type: 'object',
        additionalProperties: false,
        required: ['dpi', 'nombre', 'apellido', 'correo', 'contrasena'],
        properties: {
            dpi: { type: 'string', maxLength: 20 },
            nombre: { type: 'string', maxLength: 100 },
            apellido: { type: 'string', maxLength: 100 },
            telefono: { type: 'string', nullable: true, minLength: 7, maxLength: 20 },
            correo: { type: 'string', format: 'email', maxLength: 250 },
            contrasena: {
                type: 'string',
                format: 'password',
                minLength: 8,
                maxLength: 72,
                description: 'Máximo 72 bytes UTF-8.'
            },
            rol: {
                type: 'string',
                enum: ROLES_CLIENTE,
                default: ROLES.CLIENTE_REGULAR
            },
            estado_cuenta: {
                type: 'string',
                enum: ['ACTIVO', 'SUSPENDIDO', 'BLOQUEADO_POR_MORA'],
                default: 'ACTIVO'
            }
        }
    },
    ClienteUpdate: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
            dpi: { type: 'string', maxLength: 20 },
            nombre: { type: 'string', maxLength: 100 },
            apellido: { type: 'string', maxLength: 100 },
            telefono: { type: 'string', nullable: true, minLength: 7, maxLength: 20 },
            correo: { type: 'string', format: 'email', maxLength: 250 },
            contrasena: {
                type: 'string',
                format: 'password',
                minLength: 8,
                maxLength: 72,
                description: 'Máximo 72 bytes UTF-8.'
            },
            rol: { type: 'string', enum: ROLES_CLIENTE },
            estado_cuenta: {
                type: 'string',
                enum: ['ACTIVO', 'SUSPENDIDO', 'BLOQUEADO_POR_MORA']
            }
        }
    },
    EditorialInput: {
        type: 'object',
        additionalProperties: false,
        required: ['nombre_editorial'],
        properties: {
            nombre_editorial: { type: 'string', minLength: 1, maxLength: 150 }
        }
    },
    GeneroInput: {
        type: 'object',
        additionalProperties: false,
        required: ['nombre_genero'],
        properties: {
            nombre_genero: { type: 'string', minLength: 3, maxLength: 100 }
        }
    },
    LibroCreate: {
        type: 'object',
        additionalProperties: false,
        required: [
            'titulo',
            'isbn',
            'precio',
            'id_autor',
            'id_editorial',
            'id_genero'
        ],
        properties: {
            titulo: { type: 'string', maxLength: 200 },
            isbn: { type: 'string', maxLength: 50 },
            anio_publicacion: { type: 'integer', minimum: 1, maximum: 9999, nullable: true },
            paginas: { type: 'integer', minimum: 1, nullable: true },
            idioma_escritura: { type: 'string', maxLength: 50, nullable: true },
            precio: { type: 'number', minimum: 0, maximum: 99999999.99, multipleOf: 0.01 },
            stock: { type: 'integer', minimum: 0 },
            id_autor: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_editorial: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_genero: { type: 'integer', minimum: 1, maximum: 2147483647 }
        }
    },
    LibroUpdate: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
            titulo: { type: 'string', maxLength: 200 },
            isbn: { type: 'string', maxLength: 50 },
            anio_publicacion: { type: 'integer', minimum: 1, maximum: 9999, nullable: true },
            paginas: { type: 'integer', minimum: 1, nullable: true },
            idioma_escritura: { type: 'string', maxLength: 50, nullable: true },
            precio: { type: 'number', minimum: 0, maximum: 99999999.99, multipleOf: 0.01 },
            stock: { type: 'integer', minimum: 0 },
            id_autor: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_editorial: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_genero: { type: 'integer', minimum: 1, maximum: 2147483647 }
        }
    },
    VentaCreate: {
        type: 'object',
        additionalProperties: false,
        required: ['id_cliente', 'items'],
        properties: {
            id_cliente: { type: 'integer', minimum: 1, maximum: 2147483647 },
            items: {
                type: 'array',
                minItems: 1,
                maxItems: 100,
                description: 'No repita libros: indique la cantidad en un solo elemento. No envíe precios.',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id_libro', 'cantidad'],
                    properties: {
                        id_libro: { type: 'integer', minimum: 1, maximum: 2147483647 },
                        cantidad: { type: 'integer', minimum: 1, maximum: 2147483647 }
                    }
                }
            }
        }
    },
    PrestamoCreate: {
        type: 'object',
        additionalProperties: false,
        required: [
            'id_cliente',
            'fecha_devolucion_esperada',
            'libros'
        ],
        properties: {
            id_cliente: { type: 'integer', minimum: 1, maximum: 2147483647 },
            fecha_devolucion_esperada: {
                type: 'string',
                format: 'date',
                description: 'Fecha válida en formato YYYY-MM-DD.'
            },
            libros: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id_libro'],
                    properties: {
                        id_libro: { type: 'integer', minimum: 1, maximum: 2147483647 },
                        estado_libro_salida: {
                            type: 'string',
                            enum: ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO']
                        }
                    }
                }
            }
        }
    },
    PrestamoReturn: {
        type: 'object',
        additionalProperties: false,
        required: ['libros'],
        properties: {
            libros: {
                type: 'array',
                minItems: 1,
                description: 'Debe incluir exactamente todos los detalles pendientes del préstamo.',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['id_detalle_prestamo', 'estado_libro_entrada'],
                    properties: {
                        id_detalle_prestamo: { type: 'integer', minimum: 1 },
                        estado_libro_entrada: {
                            type: 'string',
                            enum: ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO', 'PERDIDO']
                        }
                    }
                }
            }
        }
    },
    Prestamo: {
        type: 'object',
        properties: {
            id_prestamo: { type: 'integer' },
            id_cliente: { type: 'integer' },
            id_empleado_despacha: { type: 'integer' },
            fecha_prestamo: { type: 'string', format: 'date' },
            fecha_devolucion_esperada: { type: 'string', format: 'date' },
            fecha_devolucion_real: { type: 'string', format: 'date', nullable: true },
            estado_prestamo: {
                type: 'string',
                enum: ['SOLICITADO', 'ACTIVO', 'DEVUELTO', 'VENCIDO', 'CON_MORA_PAGADA']
            },
            multa_acumulada: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' },
            libros: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id_detalle_prestamo: { type: 'integer' },
                        id_libro: { type: 'integer' },
                        estado_libro_salida: {
                            type: 'string',
                            enum: ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO']
                        },
                        estado_libro_entrada: {
                            type: 'string',
                            enum: ['NUEVO', 'BUENO', 'DESGASTADO', 'DAÑADO', 'PERDIDO'],
                            nullable: true
                        }
                    }
                }
            }
        }
    },
    Venta: {
        type: 'object',
        properties: {
            id_venta: { type: 'integer' },
            id_cliente: { type: 'integer' },
            id_empleado_cajero: { type: 'integer' },
            fecha_venta: { type: 'string', format: 'date-time' },
            total: { type: 'number' },
            moneda: { type: 'string', example: 'GTQ' },
            detalles: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id_detalle_venta: { type: 'integer' },
                        id_libro: { type: 'integer' },
                        titulo: { type: 'string' },
                        cantidad: { type: 'integer' },
                        precio_unitario_historico: { type: 'number' },
                        subtotal: { type: 'number' }
                    }
                }
            }
        }
    },
    Pagination: {
        type: 'object',
        properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
        }
    }
};

const paths = {
    '/': {
        get: operation('Información de la API', ['Información'], 'Información y enlaces a los recursos disponibles.', {
            dataSchema: null,
            responseProperties: {
                name: { type: 'string', example: 'Biblioteca Villa API' },
                version: { type: 'string', example: 'v1' },
                endpoints: { type: 'object', additionalProperties: { type: 'string' } }
            }
        })
    },
    '/auth': {
        get: operation('Listar endpoints de autenticación', ['Autenticación'], 'Rutas disponibles para registro, inicio/cierre de sesión y perfil.', {
            dataSchema: null,
            responseProperties: {
                endpoints: { type: 'object', additionalProperties: { type: 'string' } }
            }
        })
    },
    '/auth/register': {
        post: operation('Registrar cliente', ['Autenticación'], 'Cuenta regular creada y sesión iniciada.', {
            status: 201,
            requestBody: body('AuthRegister'),
            dataSchema: { $ref: '#/components/schemas/AuthSession' }
        })
    },
    '/auth/login': {
        post: operation('Iniciar sesión', ['Autenticación'], 'Credenciales válidas; devuelve un JWT de 8 horas.', {
            requestBody: body('AuthLogin'),
            dataSchema: { $ref: '#/components/schemas/AuthSession' }
        })
    },
    '/auth/me': {
        get: operation('Consultar mi perfil', ['Autenticación'], 'Perfil del usuario autenticado.', {
            protected: true,
            dataSchema: { $ref: '#/components/schemas/Cliente' }
        })
    },
    '/auth/logout': {
        post: operation('Cerrar sesión', ['Autenticación'], 'Indica al frontend que elimine el token local.', {
            protected: true,
            dataSchema: null,
            responseProperties: {
                message: { type: 'string' }
            }
        })
    },
    ...crudPaths({
        path: 'autores',
        tag: 'Autores',
        label: 'autores',
        createSchema: 'AutorInput',
        updateSchema: 'AutorInput',
        itemSchema: { $ref: '#/components/schemas/Autor' },
        writeDescription: 'Requiere un token Bearer con rol ADMIN o BIBLIOTECARIO.'
    }),
    ...crudPaths({
        path: 'clientes',
        tag: 'Clientes',
        label: 'clientes',
        createSchema: 'ClienteCreate',
        updateSchema: 'ClienteUpdate',
        itemSchema: { $ref: '#/components/schemas/Cliente' },
        readProtected: true,
        writeProtected: true,
        readDescription: 'Requiere un token Bearer con rol ADMIN.',
        writeDescription: 'Requiere un token Bearer con rol ADMIN.'
    }),
    ...crudPaths({
        path: 'empleados',
        tag: 'Empleados',
        label: 'empleados',
        createSchema: 'EmpleadoCreate',
        updateSchema: 'EmpleadoUpdate',
        itemSchema: { $ref: '#/components/schemas/Empleado' },
        readProtected: true,
        writeProtected: true,
        includePut: false,
        deleteDescription: 'Empleado suspendido correctamente.',
        readDescription: 'Requiere un token Bearer con rol ADMIN.',
        writeDescription: 'Requiere un token Bearer con rol ADMIN.'
    }),
    ...crudPaths({
        path: 'editoriales',
        tag: 'Editoriales',
        label: 'editoriales',
        createSchema: 'EditorialInput',
        updateSchema: 'EditorialInput',
        itemSchema: { $ref: '#/components/schemas/Editorial' },
        writeDescription: 'Requiere un token Bearer con rol ADMIN o BIBLIOTECARIO.'
    }),
    ...crudPaths({
        path: 'generos-literarios',
        tag: 'Géneros literarios',
        label: 'géneros literarios',
        createSchema: 'GeneroInput',
        updateSchema: 'GeneroInput',
        itemSchema: { $ref: '#/components/schemas/Genero' },
        writeDescription: 'Requiere un token Bearer con rol ADMIN o BIBLIOTECARIO.'
    }),
    ...crudPaths({
        path: 'libros',
        tag: 'Libros',
        label: 'libros',
        createSchema: 'LibroCreate',
        updateSchema: 'LibroUpdate',
        replaceSchema: 'LibroCreate',
        itemSchema: { $ref: '#/components/schemas/Libro' },
        writeDescription: 'Requiere un token Bearer con rol ADMIN o BIBLIOTECARIO.'
    }),
    '/prestamos': {
        get: operation('Listar préstamos', ['Préstamos'], 'Lista paginada; clientes solo ven sus préstamos.', {
            protected: true,
            dataSchema: { type: 'array', items: { $ref: '#/components/schemas/Prestamo' } },
            responseProperties: {
                pagination: { $ref: '#/components/schemas/Pagination' }
            },
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    schema: { type: 'integer', minimum: 1, default: 1 }
                },
                {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
                }
            ]
        }),
        post: operation('Registrar préstamo para un cliente', ['Préstamos'], 'Préstamo registrado; el empleado se obtiene del JWT.', {
            protected: true,
            description: 'Requiere ADMIN o BIBLIOTECARIO. El usuario elige el cliente; el empleado se obtiene del JWT.',
            status: 201,
            requestBody: body('PrestamoCreate'),
            dataSchema: { $ref: '#/components/schemas/Prestamo' }
        })
    },
    '/prestamos/{id}': {
        parameters: [idParameter],
        get: operation('Consultar préstamo', ['Préstamos'], 'Detalle del préstamo; clientes solo pueden consultar los propios.', {
            protected: true,
            parameters: [idParameter],
            dataSchema: { $ref: '#/components/schemas/Prestamo' }
        })
    },
    '/prestamos/{id}/devolucion': {
        parameters: [idParameter],
        post: operation('Registrar devolución del préstamo', ['Préstamos'], 'Registra condición de cada ejemplar y actualiza stock.', {
            protected: true,
            description: 'Requiere ADMIN o BIBLIOTECARIO. Debe enviar todos los detalles pendientes.',
            parameters: [idParameter],
            requestBody: body('PrestamoReturn'),
            dataSchema: { $ref: '#/components/schemas/Prestamo' }
        })
    },
    '/ventas': {
        get: operation('Listar ventas', ['Ventas'], 'Ventas de la página solicitada.', {
            protected: true,
            dataSchema: { type: 'array', items: { $ref: '#/components/schemas/Venta' } },
            responseProperties: {
                pagination: { $ref: '#/components/schemas/Pagination' }
            },
            parameters: [
                {
                    name: 'page',
                    in: 'query',
                    description: 'Número de página (por defecto 1).',
                    schema: { type: 'integer', minimum: 1, maximum: 21474836, default: 1 }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Registros por página (por defecto definido por el servicio; máximo 100).',
                    schema: { type: 'integer', minimum: 1, maximum: 100 }
                }
            ]
        }),
        post: operation('Registrar venta', ['Ventas'], 'Venta registrada correctamente.', {
            protected: true,
            description: 'Requiere ADMIN o BIBLIOTECARIO. El cajero se obtiene del JWT.',
            status: 201,
            requestBody: body('VentaCreate')
        })
    },
    '/ventas/{id}': {
        parameters: [idParameter],
        get: operation('Obtener venta por ID', ['Ventas'], 'Venta encontrada.', {
            protected: true,
            parameters: [idParameter],
            dataSchema: { $ref: '#/components/schemas/Venta' }
        })
    }
};

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Biblioteca Villa API',
        version: '1.0.0',
        description: 'Documentación pública e interactiva de los endpoints de la API. No se requiere autenticación para consultar esta documentación.'
    },
    servers: [{ url: '/api/v1', description: 'API v1 del mismo servidor' }],
    tags: [
        { name: 'Información' },
        { name: 'Autenticación' },
        { name: 'Autores' },
        { name: 'Clientes' },
        { name: 'Empleados' },
        { name: 'Editoriales' },
        { name: 'Géneros literarios' },
        { name: 'Libros' },
        { name: 'Préstamos' },
        { name: 'Ventas' }
    ],
    paths,
    components: {
        schemas,
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
};

export default swaggerSpec;
