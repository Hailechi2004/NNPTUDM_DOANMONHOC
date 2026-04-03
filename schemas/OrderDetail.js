const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
