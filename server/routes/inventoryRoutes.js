const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateInventoryItem,
  adjustStock,
  triggerAlertCheck
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getInventory);
router.put('/:id', updateInventoryItem);
router.post('/adjust', adjustStock);
router.post('/trigger-alert-check', triggerAlertCheck);

module.exports = router;
