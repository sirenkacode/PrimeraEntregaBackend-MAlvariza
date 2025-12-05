// src/dao/models/product.model.js
import mongoose from 'mongoose';

const collection = 'products';

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  code:        { type: String, required: true, unique: true },
  price:       { type: Number, required: true },
  status:      { type: Boolean, default: true },
  stock:       { type: Number, required: true },
  category:    { type: String, required: true },
  thumbnails:  { type: [String], default: [] }
}, {
  timestamps: true
});

const ProductModel = mongoose.model(collection, productSchema);
export default ProductModel;
