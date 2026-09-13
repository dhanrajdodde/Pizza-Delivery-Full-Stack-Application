const express = require('express');
const router = express.Router();
const {
  getAdminDashboardMetrics,
  getAllOrders,
  getAllUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getAdminDashboardMetrics);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);

module.exports = router;
