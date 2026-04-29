const User            = require('../models/User');
const MilkSubmission  = require('../models/MilkSubmission');
const Order           = require('../models/Order');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin')
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [users, milkStats, orderStats, dailyMilk] = await Promise.all([
      User.countDocuments(),
      MilkSubmission.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, qty: { $sum: '$quantity' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } }
      ]),
      MilkSubmission.aggregate([
        { $match: { status: 'verified' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' }}, qty: { $sum: '$quantity' } } },
        { $sort: { _id: 1 } },
        { $limit: 7 }
      ])
    ]);

    const totalMilk     = milkStats.find(s => s._id === 'verified')?.qty || 0;
    const pendingMilk   = milkStats.find(s => s._id === 'pending')?.count || 0;
    const totalOrders   = orderStats.reduce((a, s) => a + s.count, 0);
    const pendingOrders = orderStats.find(s => s._id === 'pending')?.count || 0;
    const revenue       = orderStats.find(s => s._id === 'delivered')?.revenue || 0;

    res.json({
      success: true,
      data: { users, totalMilk, pendingMilk, totalOrders, pendingOrders, revenue, milkStats, orderStats, dailyMilk }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
