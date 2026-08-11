import express from 'express';
import { ImprentaService } from '../services/imprenta_service.js';
import { checkRole } from '../middlewares/role_middleware.js';

const router = express.Router();

// GET /imprentas - Listar todas (cualquier usuario autenticado)
router.get('/', checkRole(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const imprentas = await ImprentaService.getAll();
    res.status(200).json(imprentas);
  } catch (error) {
    next(error);
  }
});

// POST /imprentas - Crear nueva (Solo Super Admin)
router.post('/', checkRole(['superadmin']), async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: 'El nombre y la dirección son obligatorios' });
    }

    const newImprenta = await ImprentaService.add({ name, address, phone });
    res.status(201).json(newImprenta);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe una imprenta con ese nombre' });
    }
    next(error);
  }
});

// PUT /imprentas/:id - Modificar (Solo Super Admin)
router.put('/:id', checkRole(['superadmin']), async (req, res, next) => {
  try {
    const updated = await ImprentaService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Imprenta no encontrada' });
    }
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE /imprentas/:id - Eliminar (Solo Super Admin)
router.delete('/:id', checkRole(['superadmin']), async (req, res, next) => {
  try {
    const deleted = await ImprentaService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Imprenta no encontrada' });
    }
    res.status(200).json({ message: 'Imprenta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

export { router as imprentaRouter };
