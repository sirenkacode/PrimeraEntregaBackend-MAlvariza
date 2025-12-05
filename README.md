# Entrega Final Backend – Coderhouse  
**Alumna:** Micaela Alvariza  
**Curso:** Backend – Coderhouse  
**Proyecto:** API de productos y carritos con persistencia en MongoDB

---

## 📌 Descripción general

Proyecto de backend en **Node.js + Express** que implementa:

- Persistencia principal en **MongoDB** (Mongoose).
- Gestión de **productos** y **carritos** con DAO/Managers.
- Endpoints REST para CRUD de productos y carritos.
- Paginación, filtros y ordenamiento de productos.
- Vista de productos y carritos con **Handlebars**.
- Vista de **productos en tiempo real** usando **Socket.io**.

Es la evolución de la entrega anterior (archivos JSON) pero con la lógica migrada a Mongo y endpoints profesionalizados.

---

## 🧰 Tecnologías utilizadas

- Node.js
- Express
- Mongoose (MongoDB)
- Express-Handlebars
- Socket.io
- Nodemon (para desarrollo)

---

## 📂 Estructura principal del proyecto

```txt
src/
  app.js
  routes/
    products.router.js
    carts.router.js
    views.router.js
  managers/
    ProductManager.js
    CartManager.js
  dao/
    models/
      product.model.js
      cart.model.js
  views/
    layouts/
      main.handlebars
    products.handlebars
    productDetail.handlebars
    cart.handlebars
    realTimeProducts.handlebars
  public/
    js/
      realtimeproducts.js
