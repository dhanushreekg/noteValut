const express = require('express');
const {
  createCheckoutSession,
  verifyPayment,
  getMyPurchases,
  getDownloadUrl,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', protect, authorize('student', 'seller', 'admin'), createCheckoutSession);
router.post('/verify', protect, authorize('student', 'seller', 'admin'), verifyPayment);
router.get('/mine', protect, getMyPurchases);
router.get('/download/:noteId', protect, getDownloadUrl);

module.exports = router;
