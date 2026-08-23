const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
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

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'paid',
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One contribution per member per month
contributionSchema.index(
  { member: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model('Contribution', contributionSchema);