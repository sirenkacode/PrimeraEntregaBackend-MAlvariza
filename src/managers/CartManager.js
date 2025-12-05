// src/managers/CartManager.js
import CartModel from '../dao/models/cart.model.js';

export default class CartManager {
  async getAll() {
    return await CartModel.find().lean();
  }

  async getById(id, { populate = false } = {}) {
    let query = CartModel.findById(id);
    if (populate) {
      query = query.populate('products.product');
    }
    const cart = await query.lean();
    return cart || null;
  }

  async create() {
    const newCart = await CartModel.create({ products: [] });
    return newCart.toObject();
  }

  async addProduct(cid, pid, quantity = 1) {
    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }

    const qty = Number(quantity) || 1;
    const existing = cart.products.find(
      p => String(p.product) === String(pid)
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.products.push({ product: pid, quantity: qty });
    }

    await cart.save();
    // devolvemos con populate para que ya venga completo
    return (await cart.populate('products.product')).toObject();
  }

  async updateProducts(cid, productsArray) {
    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }

    cart.products = productsArray.map(p => ({
      product: p.product,
      quantity: Number(p.quantity) || 1
    }));

    await cart.save();
    return (await cart.populate('products.product')).toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }

    const item = cart.products.find(p => String(p.product) === String(pid));
    if (!item) {
      const err = new Error('Producto no existe en el carrito');
      err.status = 404;
      throw err;
    }

    item.quantity = Number(quantity) || 1;
    await cart.save();
    return (await cart.populate('products.product')).toObject();
  }

  async deleteProduct(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }

    cart.products = cart.products.filter(p => String(p.product) !== String(pid));
    await cart.save();
    return (await cart.populate('products.product')).toObject();
  }

  async clearCart(cid) {
    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }
    cart.products = [];
    await cart.save();
    return cart.toObject();
  }
}
