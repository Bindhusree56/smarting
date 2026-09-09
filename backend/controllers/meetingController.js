const Meeting = require('../models/Meeting');
const Group = require('../models/Group');

// Create a meeting
const createMeeting = async (req, res) => {
  try {
    const { date, type, agenda } = req.body;

    if (!date) {
      return res.status(400).json({
        message: 'Meeting date is required',
      });
    }

    if (!req.user.group) {
      return res.status(400).json({
        message: 'You are not associated with a group',
      });
    }

    const group = await Group.findById(req.user.group);

    if (!group) {
      return res.status(404).json({
        message: 'Group not found',
      });
    }

    // Only the group head can create meetings
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the group head can create meetings',
      });
    }

    const meeting = await Meeting.create({
      group: group._id,
      createdBy: req.user._id,
      date,
      type: type || 'monthly',
      agenda: agenda || '',
      status: 'scheduled',
    });

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting,
    });
  } catch (error) {
    console.error('Create meeting error:', error);

    res.status(500).json({
      message: 'Failed to create meeting',
    });
  }
};


// Get meetings of the current user's group
const getMeetings = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(200).json({
        meetings: [],
      });
    }

    const meetings = await Meeting.find({
      group: req.user.group,
    })
      .populate('createdBy', 'name mobile')
      .sort({ date: -1 });

    res.status(200).json({
      meetings,
    });
  } catch (error) {
    console.error('Get meetings error:', error);

    res.status(500).json({
      message: 'Failed to fetch meetings',
    });
  }
};


// Get one meeting
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'name mobile')
      .populate('group', 'name code village');

    if (!meeting) {
      return res.status(404).json({
        message: 'Meeting not found',
      });
    }

    res.status(200).json({
      meeting,
    });
  } catch (error) {
    console.error('Get meeting error:', error);

    res.status(500).json({
      message: 'Failed to fetch meeting',
    });
  }
};


// Mark meeting as completed
const completeMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        message: 'Meeting not found',
      });
    }

    const group = await Group.findById(meeting.group);

    if (!group || String(group.head) !== String(req.user._id)) {
      return res.status(403).json({
        message: 'Only the group head can complete the meeting',
      });
    }

    meeting.status = 'completed';

    if (!meeting.notes && req.body.notes) {
      meeting.notes = req.body.notes;
    } else if (req.body.notes !== undefined) {
      meeting.notes = req.body.notes;
    }

    await meeting.save();

    res.status(200).json({
      message: 'Meeting completed successfully',
      meeting,
    });
  } catch (error) {
    console.error('Complete meeting error:', error);

    res.status(500).json({
      message: 'Failed to complete meeting',
    });
  }
};


module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  completeMeeting,
};