const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  description: String,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);
