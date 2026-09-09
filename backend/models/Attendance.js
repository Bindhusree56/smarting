const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },

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

    status: {
      type: String,
      enum: ['present', 'absent'],
      required: true,
    },

    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    fineStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'paid'],
      default: 'not_applicable',
    },
  },
  { timestamps: true }
);

// One attendance record per member for each meeting
attendanceSchema.index(
  { meeting: 1, member: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);