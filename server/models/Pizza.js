const mongoose = require('mongoose');

const PizzaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide pizza name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide pizza description']
  },
  category: {
    type: String,
    required: true,
    enum: ['Classic', 'Premium', 'Veggie', 'Spicy', 'Cheese Lovers', 'Custom'],
    default: 'Classic'
  },
  price: {
    type: Number,
    required: [true, 'Please provide pizza price'],
    min: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  },
  image: {
    type: String,
    default: ''
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  isChefSpecial: {
    type: Boolean,
    default: false
  },
  ingredients: [{
    type: String
  }],
  defaultConfig: {
    base: { type: String, default: 'Classic' },
    sauce: { type: String, default: 'Classic Tomato' },
    cheese: { type: String, default: 'Mozzarella' },
    vegetables: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pizza', PizzaSchema);
