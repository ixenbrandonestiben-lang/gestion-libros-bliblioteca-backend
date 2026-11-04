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

    return {
        summary,
        tags,
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
    itemSchema = {}
}) => {
    const collectionPath = `/${path}`;
    const itemPath = `${collectionPath}/{id}`;

    return {
        [collectionPath]: {
            get: operation(`Listar ${label}`, [tag], `Lista de ${label}.`, {
                dataSchema: { type: 'array', items: itemSchema }
            }),
            post: operation(`Crear ${label}`, [tag], `${label} creado correctamente.`, {
                status: 201,
                requestBody: body(createSchema),
                dataSchema: itemSchema
            })
        },
        [itemPath]: {
            parameters: [idParameter],
            get: operation(`Obtener ${label} por ID`, [tag], `${label} encontrado.`, {
                parameters: [idParameter],
                dataSchema: itemSchema
            }),
            put: operation(`Reemplazar ${label}`, [tag], `${label} actualizado correctamente.`, {
                parameters: [idParameter],
                requestBody: body(replaceSchema || updateSchema),
                dataSchema: itemSchema
            }),
            patch: operation(`Actualizar ${label}`, [tag], `${label} actualizado correctamente.`, {
                parameters: [idParameter],
                requestBody: body(updateSchema),
                dataSchema: itemSchema
            }),
            delete: operation(`Eliminar ${label}`, [tag], `${label} eliminado correctamente.`, {
                dataSchema: null,
                responseProperties: {
                    message: { type: 'string', example: `${label} eliminado correctamente` }
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
                enum: ['CLIENTE_REGULAR', 'CLIENTE_PREMIUM'],
                default: 'CLIENTE_REGULAR'
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
            rol: { type: 'string', enum: ['CLIENTE_REGULAR', 'CLIENTE_PREMIUM'] },
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
        required: ['id_cliente', 'id_empleado_cajero', 'items'],
        properties: {
            id_cliente: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_empleado_cajero: { type: 'integer', minimum: 1, maximum: 2147483647 },
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
            'id_empleado_despacha',
            'fecha_devolucion_esperada',
            'libros'
        ],
        properties: {
            id_cliente: { type: 'integer', minimum: 1, maximum: 2147483647 },
            id_empleado_despacha: { type: 'integer', minimum: 1, maximum: 2147483647 },
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
    ...crudPaths({
        path: 'clientes',
        tag: 'Clientes',
        label: 'clientes',
        createSchema: 'ClienteCreate',
        updateSchema: 'ClienteUpdate'
    }),
    ...crudPaths({
        path: 'editoriales',
        tag: 'Editoriales',
        label: 'editoriales',
        createSchema: 'EditorialInput',
        updateSchema: 'EditorialInput'
    }),
    ...crudPaths({
        path: 'generos-literarios',
        tag: 'Géneros literarios',
        label: 'géneros literarios',
        createSchema: 'GeneroInput',
        updateSchema: 'GeneroInput'
    }),
    ...crudPaths({
        path: 'libros',
        tag: 'Libros',
        label: 'libros',
        createSchema: 'LibroCreate',
        updateSchema: 'LibroUpdate',
        replaceSchema: 'LibroCreate'
    }),
    '/prestamos': {
        post: operation('Registrar préstamo', ['Préstamos'], 'Préstamo registrado correctamente.', {
            status: 201,
            requestBody: body('PrestamoCreate')
        })
    },
    '/ventas': {
        get: operation('Listar ventas', ['Ventas'], 'Ventas de la página solicitada.', {
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
            status: 201,
            requestBody: body('VentaCreate')
        })
    },
    '/ventas/{id}': {
        parameters: [idParameter],
        get: operation('Obtener venta por ID', ['Ventas'], 'Venta encontrada.', {
            parameters: [idParameter]
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
        { name: 'Clientes' },
        { name: 'Editoriales' },
        { name: 'Géneros literarios' },
        { name: 'Libros' },
        { name: 'Préstamos' },
        { name: 'Ventas' }
    ],
    paths,
    components: { schemas }
};

export default swaggerSpec;
