import { readJSON, writeJSON } from '../utils/fileDb.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARTS_PATH = path.join(__dirname, '..', 'data', 'carts.json');

export default class CartManager {
  async getAll() {
    return await readJSON(CARTS_PATH, []);
  }

  async getById(id) {
    const carts = await this.getAll();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  async create() {
    const carts = await this.getAll();
    const nextId = carts.length ? Math.max(...carts.map(c => Number(c.id))) + 1 : 1;
    const newCart = { id: nextId, products: [] };
    carts.push(newCart);
    await writeJSON(CARTS_PATH, carts);
    return newCart;
  }

  async addProduct(cid, pid, quantity = 1) {
    const carts = await this.getAll();
    const cartIdx = carts.findIndex(c => String(c.id) === String(cid));
    if (cartIdx === -1) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }

    const cart = carts[cartIdx];
    const itemIdx = cart.products.findIndex(p => String(p.product) === String(pid));

    if (itemIdx === -1) {
      cart.products.push({ product: String(pid), quantity: Number(quantity) || 1 });
    } else {
      cart.products[itemIdx].quantity += Number(quantity) || 1;
    }

    carts[cartIdx] = cart;
    await writeJSON(CARTS_PATH, carts);
    return cart;
  }
}
