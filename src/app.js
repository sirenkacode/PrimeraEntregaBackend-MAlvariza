// src/app.js
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

// Manager para la parte de WebSockets / vistas
const manager = new ProductManager();

// ---------- Middlewares ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Handlebars ----------
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- Routers ----------
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // vistas

// ---------- Manejo de errores ----------
app.use((err, req, res, _next) => {
  console.error('ERROR:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ status: 'error', error: message });
  }

  res.status(status).send(`<h1>Error</h1><p>${message}</p>`);
});

// ---------- Socket.io ----------
io.on('connection', async socket => {
  console.log('Cliente conectado por WebSocket');

  try {
    const products = await manager.getAll(); // trae todos los productos desde Mongo
    socket.emit('products', products);
  } catch (e) {
    console.error('Error al obtener productos para realtime:', e.message);
    socket.emit('error-message', 'Error al obtener productos iniciales');
  }

  // Crear producto vía WebSocket
  socket.on('new-product', async data => {
    try {
      await manager.create(data);
      const updated = await manager.getAll();
      io.emit('products', updated);
    } catch (e) {
      console.error('Error al crear producto:', e.message);
      socket.emit('error-message', e.message);
    }
  });

  // Eliminar producto vía WebSocket
  socket.on('delete-product', async pid => {
    try {
      await manager.delete(pid);
      const updated = await manager.getAll();
      io.emit('products', updated);
    } catch (e) {
      console.error('Error al eliminar producto:', e.message);
      socket.emit('error-message', e.message);
    }
  });
});

// ---------- Mongo + servidor ----------
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/coder_ecommerce';

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
