import { readJSON, writeJSON } from '../utils/fileDb.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');

export default class ProductManager {
  async getAll() {
    return await readJSON(PRODUCTS_PATH, []);
  }

  async getById(id) {
    const items = await this.getAll();
    return items.find(p => String(p.id) === String(id)) || null;
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

    // Validaciones mínimas
    if (!title || !description || !code || price == null || stock == null || !category) {
      const err = new Error('Faltan campos obligatorios: title, description, code, price, stock, category');
      err.status = 400;
      throw err;
    }
    if (typeof price !== 'number' || typeof stock !== 'number') {
      const err = new Error('price y stock deben ser numéricos');
      err.status = 400;
      throw err;
    }

    const items = await this.getAll();

    // Autogenerar id incremental simple
    const nextId = items.length ? Math.max(...items.map(p => Number(p.id))) + 1 : 1;

    const newItem = {
      id: nextId,
      title,
      description,
      code,
      price,
      status: Boolean(status),
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : []
    };

    items.push(newItem);
    await writeJSON(PRODUCTS_PATH, items);
    return newItem;
  }

  async update(id, data) {
    const items = await this.getAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    // No permitir cambiar/eliminar id
    const { id: _ignored, ...rest } = data;
    items[idx] = { ...items[idx], ...rest };
    await writeJSON(PRODUCTS_PATH, items);
    return items[idx];
  }

  async delete(id) {
    const items = await this.getAll();
    const idx = items.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    const [removed] = items.splice(idx, 1);
    await writeJSON(PRODUCTS_PATH, items);
    return removed;
  }
}
