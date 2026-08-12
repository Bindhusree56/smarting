const mongoose = require('mongoose');

// Member record holds the SHG-specific profile info for a person in a group.
// It may optionally be linked to a User account (if the member registered
// and joined themselves) or created directly by the Head without an account.
const memberSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
    },
    aadhaar: {
      type: String,
      trim: true,
      default: null,
      match: [/^[0-9]{12}$/, 'Aadhaar must be 12 digits'],
    },
    address: { type: String, trim: true },
    joinDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'active', 'removed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

memberSchema.index({ group: 1, mobile: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);
