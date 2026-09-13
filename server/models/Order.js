const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  configuration: {
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    vegetables: [{ type: String }]
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 49 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  deliveryInformation: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'IN' },
    zipCode: { type: String, required: true },
    deliveryNotes: { type: String, default: '' }
  },
  paymentInfo: {
    method: { type: String, enum: ['razorpay', 'test_sandbox'], default: 'razorpay' },
    paymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    paidAt: { type: Date, default: null }
  },
  orderStatus: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Received'
  },
  timeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ],
  estimatedDeliveryTime: {
    type: Date,
    default: () => new Date(Date.now() + 35 * 60 * 1000) // 35 minutes
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
