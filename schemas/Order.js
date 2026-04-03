const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  shippingAddress: String,
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
