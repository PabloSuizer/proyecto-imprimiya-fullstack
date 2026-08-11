import express from 'express';
import { UserService } from '../services/user_service.js';
import { checkRole } from '../middlewares/role_middleware.js';

const router = express.Router();

// GET /users - Lista completa (Solo Administradores)
router.get('/', checkRole(['admin']), async (req, res, next) => {
  try {
    const users = await UserService.getAll(); // Implementar en servicio si se requiere
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST /users - Registro público de usuario
router.post('/', async (req, res, next) => {
  try {
    const existing = await UserService.getByUsername(req.body.username);
    if (existing) return res.status(400).json({ error: 'El nombre de usuario ya existe' });

    const newUser = await UserService.add(req.body);
    res.status(201).json({ username: newUser.username, role: newUser.role });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
