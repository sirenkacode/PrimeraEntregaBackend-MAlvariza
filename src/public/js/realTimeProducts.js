// src/public/js/realTimeProducts.js
const socket = io();

const productsList = document.getElementById('products-list');
const productForm = document.getElementById('product-form');
const deleteForm = document.getElementById('delete-form');
const messagesDiv = document.getElementById('messages');

function renderProducts(products) {
  if (!products || !products.length) {
    productsList.innerHTML = '<li>No hay productos cargados.</li>';
    return;
  }

  productsList.innerHTML = products
    .map(
      p => `
      <li data-id="${p.id}">
        <strong>${p.title}</strong> - $${p.price}
        (id: ${p.id})
      </li>`
    )
    .join('');
}

// Al recibir la lista completa desde el servidor
socket.on('products', products => {
  renderProducts(products);
});

// Mensajes de error simples
socket.on('error-message', msg => {
  messagesDiv.textContent = msg;
  setTimeout(() => {
    messagesDiv.textContent = '';
  }, 4000);
});

// Enviar nuevo producto vía WebSocket
productForm.addEventListener('submit', event => {
  event.preventDefault();

  const formData = new FormData(productForm);
  const data = {
    title: formData.get('title'),
    description: formData.get('description'),
    code: formData.get('code'),
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    category: formData.get('category'),
    status: formData.get('status') === 'on',
    thumbnails: formData.get('thumbnails')
      ? formData.get('thumbnails').split(',').map(t => t.trim())
      : []
  };

  socket.emit('new-product', data);
  productForm.reset();
});

// Enviar pedido de eliminación vía WebSocket
deleteForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(deleteForm);
  const pid = formData.get('pid');
  socket.emit('delete-product', pid);
  deleteForm.reset();
});
