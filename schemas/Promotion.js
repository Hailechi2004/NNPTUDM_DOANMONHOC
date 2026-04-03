const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['Percentage', 'FixedAmount'], required: true },
  discountValue: { type: Number, required: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Promotion', promotionSchema);
