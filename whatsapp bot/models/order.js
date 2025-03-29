const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: { type: String, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'shipped'] },
  paymentLink: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);