// src/routes/views.router.js
import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const manager = new ProductManager();

router.get('/', async (_req, res, next) => {
  try {
    const products = await manager.getAll();
    res.render('home', {
      title: 'Home productos',
      products
    });
  } catch (e) {
    next(e);
  }
});

router.get('/realtimeproducts', async (_req, res, next) => {
  try {
    const products = await manager.getAll();
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real',
      products
    });
  } catch (e) {
    next(e);
  }
});

export default router;
