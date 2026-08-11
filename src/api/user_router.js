import express from 'express';
import { UserService } from '../services/user_service.js';
import { checkRole } from '../middlewares/role_middleware.js';

const router = express.Router();

// GET /users - Lista completa (Solo Administradores y Super Admins)
router.get('/', checkRole(['admin', 'superadmin']), async (req, res, next) => {
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

    // Forzar siempre el rol 'user' en el registro público por seguridad
    const newUser = await UserService.add({ ...req.body, role: 'user' });
    res.status(201).json({ username: newUser.username, role: newUser.role });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:username/role - Cambiar el rol de un usuario (Solo Super Admins)
router.patch('/:username/role', checkRole(['superadmin']), async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'superadmin'];
    
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const updatedUser = await UserService.updateRole(req.params.username, role);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Rol actualizado exitosamente', role: updatedUser.role });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
