// src/routes/products.router.js
import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import ProductModel from '../dao/models/product.model.js';

const router = Router();
const manager = new ProductManager();

// Helper para armar filtro desde query
function buildFilter(query) {
  if (!query) return {};

  // Formatos soportados:
  // ?query=category:Ropa
  // ?query=status:true
  // ?query=Ropa  (lo tomo como categoría)
  const [field, value] = query.split(':');

  if (field === 'category' && value) {
    return { category: value };
  }

  if (field === 'status' && value) {
    return { status: value === 'true' };
  }

  // Si no matchea nada raro, asumimos que el query es una categoría
  return { category: query };
}

// GET /api/products  (paginado)
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const limitNum = parseInt(limit, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;

    const filter = buildFilter(query);

    let sortOption = {};
    if (sort === 'asc') sortOption = { price: 1 };
    if (sort === 'desc') sortOption = { price: -1 };

    const totalDocs = await ProductModel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalDocs / limitNum), 1);
    const skip = (pageNum - 1) * limitNum;

    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const buildLink = (p) =>
      `${baseUrl}?limit=${limitNum}&page=${p}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '');

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(pageNum - 1) : null,
      nextLink: hasNextPage ? buildLink(pageNum + 1) : null
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
  try {
    const item = await manager.getById(req.params.pid);
    if (!item) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: item });
  } catch (e) { next(e); }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const created = await manager.create(req.body);
    res.status(201).json({ status: 'success', payload: created });
  } catch (e) { next(e); }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    res.json({ status: 'success', payload: updated });
  } catch (e) { next(e); }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
  try {
    const removed = await manager.delete(req.params.pid);
    res.json({ status: 'success', deleted: removed });
  } catch (e) { next(e); }
});

export default router;
