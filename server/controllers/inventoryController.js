const Inventory = require('../models/Inventory');
const { emitInventoryUpdate } = require('../services/socketService');
const { runLowStockCheck } = require('../jobs/lowStockCron');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });

    const stats = {
      totalItems: items.length,
      inStock: items.filter(i => i.status === 'In Stock').length,
      lowStock: items.filter(i => i.status === 'Low Stock').length,
      critical: items.filter(i => i.status === 'Critical').length,
      outOfStock: items.filter(i => i.status === 'Out of Stock').length
    };

    res.status(200).json({
      success: true,
      stats,
      inventory: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update single inventory item (quantity, threshold)
// @route   PUT /api/inventory/:id
// @access  Private/Admin
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { quantity, threshold, price } = req.body;

    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (quantity !== undefined) item.quantity = Number(quantity);
    if (threshold !== undefined) item.threshold = Number(threshold);
    if (price !== undefined) item.price = Number(price);
    item.lastUpdated = new Date();

    await item.save();

    // Emit live update
    emitInventoryUpdate(item);

    res.status(200).json({
      success: true,
      message: `Updated ${item.name} stock successfully`,
      item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Quick adjust stock (increment/decrement by delta)
// @route   POST /api/inventory/adjust
// @access  Private/Admin
exports.adjustStock = async (req, res, next) => {
  try {
    const { id, delta } = req.body;

    if (!id || delta === undefined) {
      return res.status(400).json({ success: false, message: 'Item ID and delta are required' });
    }

    let item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const newQuantity = Math.max(0, item.quantity + Number(delta));
    item.quantity = newQuantity;
    item.lastUpdated = new Date();
    await item.save();

    emitInventoryUpdate(item);

    res.status(200).json({
      success: true,
      message: `Adjusted stock for ${item.name}`,
      item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger immediate low stock check & email alert
// @route   POST /api/inventory/trigger-alert-check
// @access  Private/Admin
exports.triggerAlertCheck = async (req, res, next) => {
  try {
    await runLowStockCheck(true);
    res.status(200).json({
      success: true,
      message: 'Low stock check executed. Any alerts dispatched to administrator.'
    });
  } catch (err) {
    next(err);
  }
};
