const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const Group = require('../models/Group');

const addContribution = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(400).json({
        message: 'You do not manage a group',
      });
    }

    const group = await Group.findById(req.user.group);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the group head can add contributions',
      });
    }

    const {
      memberId,
      amount,
      month,
      year,
      paymentDate,
      status,
      notes,
    } = req.body;

    if (!memberId || !amount || !month || !year) {
      return res.status(400).json({
        message: 'Member, amount, month and year are required',
      });
    }

    const member = await Member.findOne({
      _id: memberId,
      group: group._id,
      status: 'active',
    });

    if (!member) {
      return res.status(404).json({
        message: 'Active member not found in your group',
      });
    }

    const existing = await Contribution.findOne({
      member: memberId,
      month,
      year,
    });

    if (existing) {
      return res.status(409).json({
        message: 'Contribution already exists for this member and month',
      });
    }

    const contribution = await Contribution.create({
      group: group._id,
      member: memberId,
      amount,
      month,
      year,
      paymentDate: paymentDate || Date.now(),
      status: status || 'paid',
      notes: notes || '',
    });

    const populatedContribution = await Contribution.findById(
      contribution._id
    ).populate('member', 'name mobile');

    return res.status(201).json({
      message: 'Contribution added successfully',
      contribution: populatedContribution,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Contribution already exists for this member and month',
      });
    }

    return res.status(500).json({
      message: 'Server error adding contribution',
    });
  }
};


// Get all contributions of Head's group
const getGroupContributions = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(200).json({
        contributions: [],
        totalSavings: 0,
      });
    }

    const contributions = await Contribution.find({
      group: req.user.group,
    })
      .populate('member', 'name mobile')
      .sort({ year: -1, month: -1, createdAt: -1 });

    const totalSavings = contributions.reduce(
      (total, contribution) => total + contribution.amount,
      0
    );

    return res.status(200).json({
      contributions,
      totalSavings,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Server error fetching contributions',
    });
  }
};


// Get contributions of one member
const getMemberContributions = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({
        message: 'Member not found',
      });
    }

    if (String(member.group) !== String(req.user.group)) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    const contributions = await Contribution.find({
      member: member._id,
    }).sort({
      year: -1,
      month: -1,
    });

    const totalSavings = contributions.reduce(
      (total, contribution) => total + contribution.amount,
      0
    );

    return res.status(200).json({
      contributions,
      totalSavings,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: 'Server error fetching member contributions',
    });
  }
};


module.exports = {
  addContribution,
  getGroupContributions,
  getMemberContributions,
};