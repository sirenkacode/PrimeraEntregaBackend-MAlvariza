// src/app.js
import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

// ---------- CONFIG GENERAL ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static (para JS / CSS del front)
app.use(express.static(path.join(__dirname, 'public')));

// ---------- HANDLEBARS ----------
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ---------- ROUTERS ----------
app.use('/', viewsRouter); // vistas (home y realtime)
app.use('/api/products', productsRouter); // API JSON
app.use('/api/carts', cartsRouter);

// Salud sencilla para chequear
app.get('/ping', (_req, res) => {
  res.send('API e-commerce + views + websockets OK');
});

// ---------- ERROR HANDLER ----------
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
});

// ---------- SOCKET.IO + PRODUCTOS ----------
const manager = new ProductManager();

io.on('connection', async socket => {
  console.log('Cliente conectado vía WebSocket');

  try {
    const products = await manager.getAll();
    socket.emit('products', products);
  } catch (e) {
    console.error('Error al enviar productos iniciales:', e.message);
  }

  // Crear producto desde el front via WS
  socket.on('new-product', async data => {
    try {
      await manager.create(data);
      const updated = await manager.getAll();
      io.emit('products', updated); // actualiza a todos
    } catch (e) {
      console.error('Error al crear producto:', e.message);
      socket.emit('error-message', e.message);
    }
  });

  // Eliminar producto desde el front via WS
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

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
