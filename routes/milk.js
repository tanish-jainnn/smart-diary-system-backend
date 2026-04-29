const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitMilk, getMyMilk, getAllMilk, verifyMilk, getMilkStats
} = require('../controllers/milkController');

router.post('/',            protect, authorize('farmer'),         submitMilk);
router.get('/my',           protect, authorize('farmer'),         getMyMilk);
router.get('/',             protect, authorize('admin'),          getAllMilk);
router.get('/stats',        protect, authorize('admin'),          getMilkStats);
router.patch('/:id/verify', protect, authorize('admin'),          verifyMilk);

module.exports = router;
