const Inventory = require('../models/Inventory');
const { emitInventoryUpdate } = require('./socketService');
const { sendLowStockAlert } = require('./emailService');
const User = require('../models/User');

// Decrement inventory when order is paid
const deductInventoryForOrder = async (order) => {
  const lowStockItemsAlerted = [];

  for (const item of order.items) {
    const qtyMultiplier = item.quantity || 1;
    const config = item.configuration;

    if (!config) continue;

    // Ingredients to decrement for this pizza item
    const ingredientsToDeduct = [];

    // Base
    if (config.base) {
      ingredientsToDeduct.push({ name: config.base, category: 'base', amount: 1 * qtyMultiplier });
    }
    // Sauce
    if (config.sauce) {
      ingredientsToDeduct.push({ name: config.sauce, category: 'sauce', amount: 1 * qtyMultiplier });
    }
    // Cheese
    if (config.cheese) {
      ingredientsToDeduct.push({ name: config.cheese, category: 'cheese', amount: 1 * qtyMultiplier });
    }
    // Vegetables
    if (Array.isArray(config.vegetables)) {
      config.vegetables.forEach(veg => {
        if (veg) {
          ingredientsToDeduct.push({ name: veg, category: 'vegetable', amount: 1 * qtyMultiplier });
        }
      });
    }

    // Execute atomic decrements
    for (const ing of ingredientsToDeduct) {
      // Find case-insensitive by name
      const itemDoc = await Inventory.findOne({
        name: { $regex: new RegExp(`^${ing.name}$`, 'i') }
      });

      if (itemDoc) {
        const newQty = Math.max(0, itemDoc.quantity - ing.amount);
        itemDoc.quantity = newQty;
        itemDoc.lastUpdated = new Date();
        await itemDoc.save();

        // Broadcast to admin room
        emitInventoryUpdate(itemDoc);

        // Check if item just reached or fell below threshold
        if (newQty <= itemDoc.threshold) {
          lowStockItemsAlerted.push(itemDoc);
        }
      }
    }
  }

  // If items dropped to low stock, optionally trigger email alert to admin
  if (lowStockItemsAlerted.length > 0) {
    console.warn(`⚠️ [INVENTORY ALERT] ${lowStockItemsAlerted.length} items dropped below threshold during order ${order.orderNumber}`);
    const admin = await User.findOne({ role: 'ADMIN' });
    if (admin) {
      sendLowStockAlert({
        adminEmail: admin.email,
        lowStockItems: lowStockItemsAlerted
      }).catch(err => console.error('Low stock alert error:', err.message));
    }
  }

  return lowStockItemsAlerted;
};

// Restock inventory when an order is cancelled
const restoreInventoryForOrder = async (order) => {
  for (const item of order.items) {
    const qtyMultiplier = item.quantity || 1;
    const config = item.configuration;

    if (!config) continue;

    const ingredientsToRestore = [];
    if (config.base) ingredientsToRestore.push({ name: config.base, amount: 1 * qtyMultiplier });
    if (config.sauce) ingredientsToRestore.push({ name: config.sauce, amount: 1 * qtyMultiplier });
    if (config.cheese) ingredientsToRestore.push({ name: config.cheese, amount: 1 * qtyMultiplier });
    if (Array.isArray(config.vegetables)) {
      config.vegetables.forEach(veg => {
        if (veg) ingredientsToRestore.push({ name: veg, amount: 1 * qtyMultiplier });
      });
    }

    for (const ing of ingredientsToRestore) {
      const itemDoc = await Inventory.findOne({
        name: { $regex: new RegExp(`^${ing.name}$`, 'i') }
      });
      if (itemDoc) {
        itemDoc.quantity += ing.amount;
        itemDoc.lastUpdated = new Date();
        await itemDoc.save();
        emitInventoryUpdate(itemDoc);
      }
    }
  }
};

// Check for all low stock items in the system
const checkAllLowStock = async () => {
  const allItems = await Inventory.find();
  return allItems.filter(item => item.quantity <= item.threshold);
};

module.exports = {
  deductInventoryForOrder,
  restoreInventoryForOrder,
  checkAllLowStock
};
