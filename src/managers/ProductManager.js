// src/managers/ProductManager.js
import ProductModel from '../dao/models/product.model.js';

export default class ProductManager {
  // Usado por vistas y websockets (trae TODOS sin paginar)
  async getAll() {
    return await ProductModel.find().lean();
  }

  async getById(id) {
    const product = await ProductModel.findById(id).lean();
    return product || null;
  }

  async create(data) {
    const {
      title,
      description,
      code,
      price,
      status = true,
      stock,
      category,
      thumbnails = []
    } = data;

    if (!title || !description || !code || price == null || stock == null || !category) {
      const err = new Error('Faltan campos obligatorios: title, description, code, price, stock, category');
      err.status = 400;
      throw err;
    }
    if (typeof Number(price) !== 'number' || typeof Number(stock) !== 'number') {
      const err = new Error('price y stock deben ser numéricos');
      err.status = 400;
      throw err;
    }

    const newProduct = await ProductModel.create({
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails)
        ? thumbnails
        : (typeof thumbnails === 'string' && thumbnails.trim().length
            ? thumbnails.split(',').map(t => t.trim())
            : [])
    });

    return newProduct.toObject();
  }

  async update(id, data) {
    const { _id, id: _ignored, ...rest } = data;

    const updated = await ProductModel.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true, runValidators: true, lean: true }
    );

    if (!updated) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }

    return updated;
  }

  async delete(id) {
    const deleted = await ProductModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    return deleted;
  }
}
