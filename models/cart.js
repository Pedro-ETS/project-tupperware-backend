const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  products: [{
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'card' },
    quantity: { type: Number, default: 0 }
  }]
});

module.exports = mongoose.model('cart', cartSchema);