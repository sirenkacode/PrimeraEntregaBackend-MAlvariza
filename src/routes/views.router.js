// src/routes/views.router.js
import { Router } from 'express';
import ProductModel from '../dao/models/product.model.js';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Helper para filtro (misma lógica que en products.router)
function buildFilter(query) {
  if (!query) return {};
  const [field, value] = query.split(':');

  if (field === 'category' && value) return { category: value };
  if (field === 'status' && value) return { status: value === 'true' };

  return { category: query };
}

// Redirigimos / a /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

// Vista paginada de productos
router.get('/products', async (req, res, next) => {
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

    const basePath = '/products';
    const buildLink = (p) =>
      `${basePath}?limit=${limitNum}&page=${p}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '');

    res.render('products', {
      title: 'Listado de productos',
      products,
      totalPages,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? pageNum - 1 : null,
      nextPage: hasNextPage ? pageNum + 1 : null,
      prevLink: hasPrevPage ? buildLink(pageNum - 1) : null,
      nextLink: hasNextPage ? buildLink(pageNum + 1) : null,
      sort,
      query
    });
  } catch (e) {
    next(e);
  }
});

// Vista detalle de producto (opción 1 de la consigna)
router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product) {
      return res.status(404).render('productDetail', {
        title: 'Producto no encontrado',
        product: null
      });
    }

    // Si querés probar el botón de agregar al carrito desde la vista,
    // podés pasar ?cid=ID_CARRITO en la URL
    const demoCartId = req.query.cid || null;

    res.render('productDetail', {
      title: product.title,
      product,
      demoCartId
    });
  } catch (e) {
    next(e);
  }
});

// Vista de realtime products (ya la tenías)
router.get('/realtimeproducts', async (_req, res, next) => {
  try {
    const products = await productManager.getAll();
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real',
      products
    });
  } catch (e) {
    next(e);
  }
});

// Vista de carrito /carts/:cid
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await cartManager.getById(req.params.cid, { populate: true });
    if (!cart) {
      return res.status(404).render('cart', {
        title: 'Carrito no encontrado',
        cart: null
      });
    }

    res.render('cart', {
      title: `Carrito ${cart._id}`,
      cart
    });
  } catch (e) {
    next(e);
  }
});

export default router;
