let io = null;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    // Join order room for live tracking
    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined room: order_${orderId}`);
      }
    });

    // Leave order room
    socket.on('leave_order_room', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
        console.log(`Socket ${socket.id} left room: order_${orderId}`);
      }
    });

    // Join admin room for order notifications and inventory alerts
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`Admin socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Emit order status update to customer tracking room
const emitOrderStatusUpdate = (order) => {
  if (io && order) {
    io.to(`order_${order._id}`).emit('order_status_updated', {
      orderId: order._id,
      orderStatus: order.orderStatus,
      timeline: order.timeline,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      updatedAt: new Date()
    });

    // Also notify admin room
    io.to('admin_room').emit('admin_order_status_updated', {
      orderId: order._id,
      orderStatus: order.orderStatus,
      updatedAt: new Date()
    });
  }
};

// Emit new order placed to admin operations center
const emitNewOrder = (order) => {
  if (io && order) {
    io.to('admin_room').emit('new_order_placed', {
      order,
      timestamp: new Date()
    });
  }
};

// Emit inventory update
const emitInventoryUpdate = (inventoryItem) => {
  if (io && inventoryItem) {
    io.to('admin_room').emit('inventory_updated', {
      item: inventoryItem,
      timestamp: new Date()
    });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitNewOrder,
  emitInventoryUpdate
};
