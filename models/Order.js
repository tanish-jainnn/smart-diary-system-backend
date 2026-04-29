const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity:    { type: Number, required: true, min: 0.5 },
  packets: {
    oneL:   { type: Number, default: 0 },
    halfL:  { type: Number, default: 0 },
  },
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pricePerLitre: { type: Number, default: 60 },
  totalPrice:    { type: Number, required: true },
  deliveryAddress: { type: String, default: '' },
  notes:           { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  const qty = this.quantity;
  this.packets.oneL  = Math.floor(qty);
  this.packets.halfL = Math.round((qty - Math.floor(qty)) * 2);
  this.totalPrice    = qty * this.pricePerLitre;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
