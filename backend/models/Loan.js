const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },

    principalAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },

    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },

    interestAmount: {
      type: Number,
      required: true,
    },

    totalPayable: {
      type: Number,
      required: true,
    },

    monthlyPayment: {
      type: Number,
      required: true,
    },

    remainingBalance: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },

    startDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Loan', loanSchema);