import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const manager = new ProductManager();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const data = await manager.getAll();
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
  try {
    const item = await manager.getById(req.params.pid);
    if (!item) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(item);
  } catch (e) { next(e); }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const created = await manager.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
  try {
    const removed = await manager.delete(req.params.pid);
    res.json({ deleted: removed });
  } catch (e) { next(e); }
});

export default router;
