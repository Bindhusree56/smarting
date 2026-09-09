const Attendance = require('../models/Attendance');
const Meeting = require('../models/Meeting');
const Member = require('../models/Member');
const Fine = require('../models/Fine');
const Group = require('../models/Group');

// Save attendance for a meeting
const saveAttendance = async (req, res) => {
  try {
    const { meetingId, attendance, finePerAbsence } = req.body;

    if (!meetingId || !Array.isArray(attendance)) {
      return res.status(400).json({
        message: 'Meeting and attendance data are required',
      });
    }

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        message: 'Meeting not found',
      });
    }

    const group = await Group.findById(meeting.group);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    // Only the group head can record attendance
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the group head can record attendance',
      });
    }

    const fineAmount = Number(finePerAbsence || 0);

    if (fineAmount < 0) {
      return res.status(400).json({
        message: 'Fine amount cannot be negative',
      });
    }

    const results = [];

    for (const record of attendance) {
      const { memberId, status } = record;

      if (!memberId || !['present', 'absent'].includes(status)) {
        continue;
      }

      const member = await Member.findOne({
        _id: memberId,
        group: meeting.group,
        status: 'active',
      });

      if (!member) {
        continue;
      }

      const fine = status === 'absent' ? fineAmount : 0;

      const fineStatus =
        status === 'absent' && fine > 0
          ? 'pending'
          : 'not_applicable';

      // Create or update attendance
      const attendanceRecord = await Attendance.findOneAndUpdate(
        {
          meeting: meeting._id,
          member: member._id,
        },
        {
          group: meeting.group,
          status,
          fineAmount: fine,
          fineStatus,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      // If absent and fine applies, create/update Fine
      if (status === 'absent' && fine > 0) {
        await Fine.findOneAndUpdate(
          {
            meeting: meeting._id,
            member: member._id,
          },
          {
            group: meeting.group,
            amount: fine,
            reason: 'Absent from meeting',
            status: 'pending',
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );
      }

      // If member is marked present, remove any unpaid fine
      if (status === 'present') {
        await Fine.deleteOne({
          meeting: meeting._id,
          member: member._id,
          status: 'pending',
        });
      }

      results.push(attendanceRecord);
    }

    res.status(200).json({
      message: 'Attendance saved successfully',
      attendance: results,
    });
  } catch (error) {
    console.error('Save attendance error:', error);

    res.status(500).json({
      message: 'Failed to save attendance',
    });
  }
};


// Get attendance for one meeting
const getMeetingAttendance = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({
        message: 'Meeting not found',
      });
    }

    const attendance = await Attendance.find({
      meeting: meeting._id,
    })
      .populate('member', 'name mobile')
      .sort({ createdAt: 1 });

    res.status(200).json({
      attendance,
    });
  } catch (error) {
    console.error('Get attendance error:', error);

    res.status(500).json({
      message: 'Failed to fetch attendance',
    });
  }
};


// Get attendance history for current member
const getMyAttendance = async (req, res) => {
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

    const attendance = await Attendance.find({
      member: member._id,
    })
      .populate('meeting', 'date type agenda')
      .sort({ createdAt: -1 });

    res.status(200).json({
      attendance,
    });
  } catch (error) {
    console.error('Get my attendance error:', error);

    res.status(500).json({
      message: 'Failed to fetch attendance history',
    });
  }
};


module.exports = {
  saveAttendance,
  getMeetingAttendance,
  getMyAttendance,
};