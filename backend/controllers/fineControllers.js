const Fine = require('../models/Fine');
const Member = require('../models/Member');

const getMyFines = async (req, res) => {
  try {
    const member = await Member.findOne({
      user: req.user._id,
      status: 'active',
    });

    if (!member) {
      return res.status(404).json({
        message: 'Active member profile not found',
      });
    }

    const fines = await Fine.find({
      member: member._id,
    })
      .populate('meeting', 'date type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      fines,
    });
  } catch (error) {
    console.error('Get my fines error:', error);

    res.status(500).json({
      message: 'Failed to fetch fines',
    });
  }
};

module.exports = {
  getMyFines,
};