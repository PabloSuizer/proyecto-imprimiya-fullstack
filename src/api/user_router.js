import express from 'express';
import { UserService } from '../services/user_service.js';
import { checkRole } from '../middlewares/role_middleware.js';

const router = express.Router();

// GET /users - Lista completa (Solo Administradores)
router.get('/', checkRole(['admin']), async (req, res, next) => {
  try {
    const users = await UserService.getAll();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST /users - Registro de usuario por parte del administrador
router.post('/', checkRole(['admin']), async (req, res, next) => {
  try {
    const existing = await UserService.getByUsername(req.body.username);
    if (existing) return res.status(400).json({ error: 'El nombre de usuario ya existe' });

    const newUser = await UserService.add({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || 'user'
    });
    res.status(201).json({ username: newUser.username, role: newUser.role });
  } catch (error) {
    next(error);
  }
});

// PATCH /users/:username/role - Cambiar el rol de un usuario (Solo Administradores)
router.patch('/:username/role', checkRole(['admin']), async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin'];

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

// DELETE /users/:username - Eliminar un usuario (Solo Administradores)
router.delete('/:username', checkRole(['admin']), async (req, res, next) => {
  try {
    const deletedUser = await UserService.delete(req.params.username);
    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
