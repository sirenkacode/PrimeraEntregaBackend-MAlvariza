import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const manager = new CartManager();

// POST /api/carts
router.post('/', async (req, res, next) => {
  try {
    const created = await manager.create();
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    // La consigna pide listar los productos del carrito; devolvemos el objeto entero (incluye products)
    res.json(cart.products);
  } catch (e) { next(e); }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body ?? {};
    const cart = await manager.addProduct(req.params.cid, req.params.pid, quantity ?? 1);
    res.status(201).json(cart);
  } catch (e) { next(e); }
});

export default router;
