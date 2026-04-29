const mongoose = require('mongoose');

const milkSchema = new mongoose.Schema({
  farmer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: Date, required: true },
  quantity: { type: Number, required: true, min: 0.5 },
  grade:    { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  status:   { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  pricePerLitre: { type: Number, default: 60 },
  earnings: { type: Number, default: 0 },
  notes:    { type: String, default: '' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt:  { type: Date, default: null },
}, { timestamps: true });

milkSchema.pre('save', function (next) {
  if (this.status === 'verified') {
    this.earnings = this.quantity * this.pricePerLitre;
  }
  next();
});

module.exports = mongoose.model('MilkSubmission', milkSchema);
