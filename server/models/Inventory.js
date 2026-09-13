const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['base', 'sauce', 'cheese', 'vegetable']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity in stock'],
    min: [0, 'Quantity cannot be negative'],
    default: 50
  },
  threshold: {
    type: Number,
    required: [true, 'Please provide threshold alert level'],
    min: [1, 'Threshold must be at least 1'],
    default: 15
  },
  unit: {
    type: String,
    required: true,
    default: 'units'
  },
  price: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Calculate stock status dynamically
InventorySchema.virtual('status').get(function () {
  if (this.quantity <= 0) return 'Out of Stock';
  if (this.quantity <= Math.ceil(this.threshold * 0.4)) return 'Critical';
  if (this.quantity <= this.threshold) return 'Low Stock';
  return 'In Stock';
});

InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);
