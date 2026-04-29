const MilkSubmission = require('../models/MilkSubmission');

// POST /api/milk  (farmer)
exports.submitMilk = async (req, res) => {
  try {
    const { date, quantity, grade, notes } = req.body;
    if (!date || !quantity)
      return res.status(400).json({ success: false, message: 'Date and quantity are required' });

    const pricePerLitre = Number(process.env.MILK_PRICE_PER_LITRE) || 60;
    const milk = await MilkSubmission.create({
      farmer: req.user._id,
      date,
      quantity: parseFloat(quantity),
      grade: grade || 'A',
      notes,
      pricePerLitre,
    });
    await milk.populate('farmer', 'name email');
    res.status(201).json({ success: true, data: milk });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/milk/my  (farmer - own submissions)
exports.getMyMilk = async (req, res) => {
  try {
    const records = await MilkSubmission.find({ farmer: req.user._id })
      .sort({ date: -1 })
      .populate('farmer', 'name email');
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/milk  (admin - all)
exports.getAllMilk = async (req, res) => {
  try {
    const { status, farmerId } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (farmerId) filter.farmer   = farmerId;
    const records = await MilkSubmission.find(filter)
      .sort({ createdAt: -1 })
      .populate('farmer', 'name email')
      .populate('verifiedBy', 'name');
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/milk/:id/verify  (admin)
exports.verifyMilk = async (req, res) => {
  try {
    const milk = await MilkSubmission.findById(req.params.id);
    if (!milk) return res.status(404).json({ success: false, message: 'Submission not found' });

    const { status } = req.body; // 'verified' or 'rejected'
    milk.status     = status || 'verified';
    milk.verifiedBy = req.user._id;
    milk.verifiedAt = new Date();
    if (milk.status === 'verified') {
      milk.earnings = milk.quantity * milk.pricePerLitre;
    }
    await milk.save();
    await milk.populate('farmer', 'name email');
    res.json({ success: true, data: milk });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/milk/stats  (admin)
exports.getMilkStats = async (req, res) => {
  try {
    const stats = await MilkSubmission.aggregate([
      { $group: {
          _id: '$status',
          totalQty: { $sum: '$quantity' },
          totalEarnings: { $sum: '$earnings' },
          count: { $sum: 1 },
      }},
    ]);
    const daily = await MilkSubmission.aggregate([
      { $match: { status: 'verified' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' }},
          qty: { $sum: '$quantity' },
      }},
      { $sort: { _id: 1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, stats, daily });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
