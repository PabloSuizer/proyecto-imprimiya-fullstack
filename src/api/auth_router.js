import express from 'express';
import { LoginService } from '../services/login_service.js';

const router = express.Router();

// POST /auth/login - Iniciar sesión
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const session = await LoginService.login(username, password);
    res.status(200).json({ 
      message: 'Login exitoso', 
      token: session.token 
    });
  } catch (error) {
    if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    next(error);
  }
});

export { router as authRouter };
