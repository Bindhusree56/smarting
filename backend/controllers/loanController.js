const Loan = require('../models/Loan');
const Member = require('../models/Member');

// Member requests a loan
const requestLoan = async (req, res) => {
  try {
    const {
      principalAmount,
      interestRate,
      durationMonths,
    } = req.body;

    // Find the Member record belonging to the logged-in User
    const member = await Member.findOne({
      user: req.user._id,
      status: 'active',
    });

    if (!member) {
      return res.status(404).json({
        message: 'Active member profile not found for this account',
      });
    }

    // The group comes directly from the Member record
    const groupId = member.group;

    if (
      principalAmount == null ||
      interestRate == null ||
      !durationMonths
    ) {
      return res.status(400).json({
        message: 'All loan details are required',
      });
    }

    const amount = Number(principalAmount);
    const rate = Number(interestRate);
    const months = Number(durationMonths);

    if (amount <= 0 || rate < 0 || months <= 0) {
      return res.status(400).json({
        message: 'Invalid loan details',
      });
    }

    // Simple Interest
    const timeInYears = months / 12;

    const interestAmount =
      amount * rate * timeInYears / 100;

    const totalPayable =
      amount + interestAmount;

    const monthlyPayment =
      totalPayable / months;

    const loan = await Loan.create({
      member: member._id,
      group: groupId,

      principalAmount: amount,
      interestRate: rate,
      durationMonths: months,

      interestAmount: Number(interestAmount.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2)),
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      remainingBalance: Number(totalPayable.toFixed(2)),

      status: 'pending',
    });

    res.status(201).json({
      message: 'Loan request submitted successfully',
      loan,
    });

  } catch (error) {
    console.error('Request loan error:', error);

    res.status(500).json({
      message: 'Failed to submit loan request',
    });
  }
};

// Head approves a loan
const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending loans can be approved',
      });
    }

    loan.status = 'approved';
    loan.startDate = new Date();

    await loan.save();

    res.status(200).json({
      message: 'Loan approved successfully',
      loan,
    });
  } catch (error) {
    console.error('Approve loan error:', error);

    res.status(500).json({
      message: 'Failed to approve loan',
    });
  }
};


// Head rejects a loan
const rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found',
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending loans can be rejected',
      });
    }

    loan.status = 'rejected';

    await loan.save();

    res.status(200).json({
      message: 'Loan rejected successfully',
      loan,
    });
  } catch (error) {
    console.error('Reject loan error:', error);

    res.status(500).json({
      message: 'Failed to reject loan',
    });
  }
};


// Get all loans
const getMyLoans = async (req, res) => {
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

    const loans = await Loan.find({
      member: member._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      loans,
    });

  } catch (error) {
    console.error('Get my loans error:', error);

    res.status(500).json({
      message: 'Failed to fetch loans',
    });
  }
};


// Get a single loan
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('member')
      .populate('group');

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found',
      });
    }

    res.status(200).json({
      loan,
    });
  } catch (error) {
    console.error('Get loan error:', error);

    res.status(500).json({
      message: 'Failed to fetch loan',
    });
  }
};


module.exports = {
  requestLoan,
  approveLoan,
  rejectLoan,
  getMyLoans,
  getLoanById,
};