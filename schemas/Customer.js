const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  phone: String,
  address: String,
  loyaltyPoints: { type: Number, default: 0 }
});

module.exports = mongoose.model('Customer', customerSchema);
