import express from 'express';
import mongoose from 'mongoose';
import { config } from './config.js';
import { userRouter } from './src/api/user_router.js';
import { checkAuthorizationToken } from './src/middlewares/auth_middleware.js';

const app = express();

// Middlewares de Aplicación
app.use(express.json());
app.use(checkAuthorizationToken);

// Registro de Rutas
app.use('/users', userRouter);

// Middleware de Manejo de Errores Global (Siempre al final)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Inicialización asincrónica de BDD y Servidor
async function startServer() {
  try {
    await mongoose.connect(config.dbConnection);
    console.log('📦 Conexión exitosa a la base de datos MongoDB.');
    
    app.listen(config.port, () => {
      console.log(`🚀 Servidor ejecutándose correctamente en el puerto ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
  }
}

startServer();
