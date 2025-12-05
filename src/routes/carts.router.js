// src/routes/carts.router.js
import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const manager = new CartManager();

// POST /api/carts  -> crear carrito vacío
router.post('/', async (req, res, next) => {
  try {
    const created = await manager.create();
    res.status(201).json({ status: 'success', payload: created });
  } catch (e) { next(e); }
});

// GET /api/carts/:cid  -> carrito con populate
router.get('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.getById(req.params.cid, { populate: true });
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// POST /api/carts/:cid/product/:pid  -> agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body ?? {};
    const cart = await manager.addProduct(
      req.params.cid,
      req.params.pid,
      quantity ?? 1
    );
    res.status(201).json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// DELETE /api/carts/:cid/products/:pid  -> eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res, next) => {
  try {
    const cart = await manager.deleteProduct(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// PUT /api/carts/:cid  -> reemplazar TODO el arreglo de products
router.put('/:cid', async (req, res, next) => {
  try {
    const products = Array.isArray(req.body.products)
      ? req.body.products
      : Array.isArray(req.body)
        ? req.body
        : [];

    if (!products.length) {
      const err = new Error('Se requiere un arreglo de productos para actualizar el carrito');
      err.status = 400;
      throw err;
    }

    const cart = await manager.updateProducts(req.params.cid, products);
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// PUT /api/carts/:cid/products/:pid  -> actualizar SOLO la cantidad
router.put('/:cid/products/:pid', async (req, res, next) => {
  try {
    const { quantity } = req.body ?? {};
    if (quantity == null) {
      const err = new Error('Se requiere la propiedad quantity en el body');
      err.status = 400;
      throw err;
    }

    const cart = await manager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );

    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

// DELETE /api/carts/:cid  -> eliminar TODOS los productos (vaciar)
router.delete('/:cid', async (req, res, next) => {
  try {
    const cart = await manager.clearCart(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (e) { next(e); }
});

export default router;
