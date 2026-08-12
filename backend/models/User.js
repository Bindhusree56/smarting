const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits'],
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['head', 'member'], required: true },
    preferredLanguage: { type: String, enum: ['en', 'te'], default: 'en' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
