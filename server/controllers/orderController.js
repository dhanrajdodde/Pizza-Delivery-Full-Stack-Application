const Order = require('../models/Order');
const { emitOrderStatusUpdate } = require('../services/socketService');
const { restoreInventoryForOrder } = require('../services/inventoryService');

// Helper to generate readable order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `PV-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Verified user only)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryInformation, pricing } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    if (!deliveryInformation || !deliveryInformation.street || !deliveryInformation.phone) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
    }

    // Calculate subtotal on server to avoid tampering
    let calculatedSubtotal = 0;
    const formattedItems = items.map(item => {
      const unitPrice = Number(item.unitPrice || item.price);
      const quantity = Number(item.quantity || 1);
      const totalPrice = unitPrice * quantity;
      calculatedSubtotal += totalPrice;

      return {
        pizza: item.pizzaId || undefined,
        name: item.name,
        isCustom: !!item.isCustom,
        configuration: {
          base: item.configuration?.base || 'Classic',
          sauce: item.configuration?.sauce || 'Classic Tomato',
          cheese: item.configuration?.cheese || 'Mozzarella',
          vegetables: item.configuration?.vegetables || []
        },
        quantity,
        unitPrice,
        totalPrice
      };
    });

    const deliveryFee = calculatedSubtotal > 499 ? 0 : 49;
    const tax = Math.round(calculatedSubtotal * 0.05); // 5% GST
    const totalAmount = calculatedSubtotal + deliveryFee + tax;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: formattedItems,
      pricing: {
        subtotal: calculatedSubtotal,
        deliveryFee,
        tax,
        totalAmount
      },
      deliveryInformation: {
        fullName: deliveryInformation.fullName || req.user.name,
        phone: deliveryInformation.phone || req.user.phone,
        street: deliveryInformation.street,
        city: deliveryInformation.city || 'Tech City',
        state: deliveryInformation.state || 'Karnataka',
        zipCode: deliveryInformation.zipCode || '560001',
        deliveryNotes: deliveryInformation.deliveryNotes || ''
      },
      paymentInfo: {
        status: 'Pending'
      },
      orderStatus: 'Order Received',
      timeline: [
        {
          status: 'Order Initiated',
          timestamp: new Date(),
          note: 'Order created awaiting payment.'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Proceed to payment.',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: user must own order or be admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by kitchen team.`
    });

    await order.save();

    // Broadcast real-time update to customer via Socket.IO
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (by customer or admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: User must own the order or be Admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Already cancelled
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    // Already delivered or out for delivery
    if (['Sent to Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${order.orderStatus}'. Please contact store support.`
      });
    }

    // Update status to Cancelled
    order.orderStatus = 'Cancelled';
    if (order.paymentInfo.status === 'Paid') {
      order.paymentInfo.status = 'Refunded';
    }

    order.timeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason ? `Order cancelled: ${reason}` : 'Order cancelled by customer. Refund initiated.'
    });

    await order.save();

    // Restock inventory
    await restoreInventoryForOrder(order);

    // Broadcast live Socket.IO update to customer tracking room & admin
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      message: 'Order has been cancelled successfully. Inventory restored and refund initiated.',
      order
    });
  } catch (err) {
    next(err);
  }
};
