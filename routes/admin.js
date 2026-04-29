const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, deleteUser, toggleUser, getDashboard } = require('../controllers/adminController');

router.get('/dashboard',        protect, authorize('admin'), getDashboard);
router.get('/users',            protect, authorize('admin'), getAllUsers);
router.delete('/users/:id',     protect, authorize('admin'), deleteUser);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUser);

module.exports = router;
