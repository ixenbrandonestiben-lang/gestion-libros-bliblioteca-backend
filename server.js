import expres from 'express';
import { conexionBaseDeDatos } from './config/db.js';

const app = expres();
const PORT =  process.env.SERVER_PORT;
const NombreBaseDAtos = process.env.DB_NAME;

app.get('/api/estado', async (req, res, next) =>{
   try {
     const estadoConeccion = await conexionBaseDeDatos();

    if(estadoConeccion){
        return res.status(200).json({
            status: "Exitoso.",
            message: `Conexion exitosa con la base de datos: ${NombreBaseDAtos}`
        });
    }else{
        return res.status(500).json({
            status: "Error.",
            message: "No se buene establecer la conexion con la base de datos"
        });
    }
   } catch (error) {
        next(error);
   }
});

app.listen(PORT, ()=>{
    console.log(`Base de datos corriendo en: http://localhost:${PORT}`);
});