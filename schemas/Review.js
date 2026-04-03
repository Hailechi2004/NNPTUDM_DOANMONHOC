const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
