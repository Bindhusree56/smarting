const mongoose = require('mongoose');

const bankRepaymentSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    totalDue: {
      type: Number,
      required: true,
      min: 0,
    },

    totalCollected: {
      type: Number,
      required: true,
      min: 0,
    },

    bankAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    bankReference: {
      type: String,
      default: '',
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },

    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BankRepayment', bankRepaymentSchema);