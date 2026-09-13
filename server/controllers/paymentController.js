const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { deductInventoryForOrder } = require('../services/inventoryService');
const { emitNewOrder, emitOrderStatusUpdate } = require('../services/socketService');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_pizzaverse12345';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_test_pizzaverse67890';

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    return razorpayInstance;
  } catch (err) {
    console.warn(`Razorpay init error: ${err.message}`);
    return null;
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_pizzaverse12345';
    const razorpay = getRazorpayInstance();

    // Check if we can create a live/test order with Razorpay API
    try {
      if (razorpay && !keyId.includes('pizzaverse12345')) {
        const options = {
          amount: Math.round(amount * 100), // convert to paise
          currency,
          receipt: receipt || `rec_${Date.now()}`,
          payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);
        return res.status(200).json({
          success: true,
          keyId,
          order: razorpayOrder,
          isSimulation: false
        });
      }
    } catch (razorErr) {
      console.warn(`Razorpay API create order warning: ${razorErr.message}. Falling back to safe test simulation.`);
    }

    // Safe Test Mode Fallback
    const simulatedOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    res.status(200).json({
      success: true,
      keyId,
      order: {
        id: simulatedOrderId,
        amount: Math.round(amount * 100),
        currency,
        receipt: receipt || `rec_${Date.now()}`,
        status: 'created'
      },
      isSimulation: true,
      message: 'Razorpay Test Sandbox Simulation mode active.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment and confirm order
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId, // PizzaVerse Order DB ID
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isSimulation
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let isValid = false;

    if (isSimulation) {
      isValid = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_test_pizzaverse67890';
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      order.paymentInfo.status = 'Failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed'
      });
    }

    // Payment Success!
    order.paymentInfo.status = 'Paid';
    order.paymentInfo.paidAt = new Date();
    order.paymentInfo.paymentId = razorpayPaymentId || `pay_sim_${Date.now()}`;
    order.paymentInfo.razorpayOrderId = razorpayOrderId;
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.razorpaySignature = razorpaySignature;
    order.orderStatus = 'Order Received';
    order.timeline.push({
      status: 'Order Received',
      timestamp: new Date(),
      note: 'Payment verified. Order confirmed and sent to kitchen prep.'
    });

    await order.save();

    // 1. Deduct Inventory automatically
    await deductInventoryForOrder(order);

    // 2. Broadcast to user tracking room and admin operations center
    emitOrderStatusUpdate(order);
    emitNewOrder(order);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully. Order is being prepared!',
      order
    });
  } catch (err) {
    next(err);
  }
};
