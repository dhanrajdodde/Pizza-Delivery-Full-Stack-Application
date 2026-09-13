const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  adminLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  quickVerifyDev
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/quick-verify', quickVerifyDev);

module.exports = router;
