const Order = require('../models/Order');

// POST /api/orders  (customer)
exports.placeOrder = async (req, res) => {
  try {
    const { quantity, deliveryDate, deliveryAddress, notes } = req.body;
    if (!quantity || !deliveryDate)
      return res.status(400).json({ success: false, message: 'Quantity and delivery date are required' });

    const pricePerLitre = Number(process.env.MILK_PRICE_PER_LITRE) || 60;
    const qty = parseFloat(quantity);
    const order = await Order.create({
      customer: req.user._id,
      quantity: qty,
      deliveryDate,
      deliveryAddress,
      notes,
      pricePerLitre,
      totalPrice: qty * pricePerLitre,
    });
    await order.populate('customer', 'name email');
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my  (customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('customer', 'name email phone')
      .populate('updatedBy', 'name');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status    = status;
    order.updatedBy = req.user._id;
    await order.save();
    await order.populate('customer', 'name email');
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/stats  (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          qty: { $sum: '$quantity' },
      }},
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    res.json({ success: true, stats, totalRevenue: totalRevenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
