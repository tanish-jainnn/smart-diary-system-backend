const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  placeOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderStats
} = require('../controllers/orderController');

router.post('/',              protect, authorize('customer'),      placeOrder);
router.get('/my',             protect, authorize('customer'),      getMyOrders);
router.get('/',               protect, authorize('admin'),         getAllOrders);
router.get('/stats',          protect, authorize('admin'),         getOrderStats);
router.patch('/:id/status',   protect, authorize('admin'),         updateOrderStatus);

module.exports = router;
