const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [{
    part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, default: 1 }
  }]
});

module.exports = mongoose.model('Cart', cartSchema);
