const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');
const generateGroupCode = require('../utils/generateGroupCode');

// @route  POST /api/groups
// @desc   Head creates a new SHG and receives an auto-generated group code
// @access Private (head)
const createGroup = async (req, res) => {
  try {
    if (req.user.group) {
      return res.status(400).json({ message: 'You already manage a group' });
    }

    const { name, village, address, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const code = await generateGroupCode();

    const group = await Group.create({
      name,
      code,
      village,
      address,
      description,
      head: req.user._id,
    });

    req.user.group = group._id;
    await req.user.save();

    return res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error creating group' });
  }
};

// @route  GET /api/groups/mine
// @desc   Get the logged-in user's group (head or approved member)
// @access Private
const getMyGroup = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(404).json({ message: 'You are not part of any group yet' });
    }
    const group = await Group.findById(req.user.group).populate('head', 'name mobile');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const memberCount = await Member.countDocuments({ group: group._id, status: 'active' });
    return res.status(200).json({ group, memberCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching group' });
  }
};

// @route  GET /api/groups/lookup/:code
// @desc   Look up basic group info by code before joining
// @access Private
const lookupGroupByCode = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const group = await Group.findOne({ code }).populate('head', 'name mobile');
    if (!group) {
      return res.status(404).json({ message: 'No group found with this code' });
    }
    return res.status(200).json({ group });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error looking up group' });
  }
};

// @route  PUT /api/groups/:id
// @desc   Head edits group details
// @access Private (head, must own the group)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group head can edit this group' });
    }

    const { name, village, address, description } = req.body;
    if (name) group.name = name;
    if (village !== undefined) group.village = village;
    if (address !== undefined) group.address = address;
    if (description !== undefined) group.description = description;

    await group.save();
    return res.status(200).json({ message: 'Group updated successfully', group });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating group' });
  }
};

// @route  POST /api/groups/join
// @desc   Member joins a group using a group code (creates a pending Member record)
// @access Private (member)
const joinGroup = async (req, res) => {
  try {
    const { code, aadhaar, address } = req.body;
    if (!code) return res.status(400).json({ message: 'Group code is required' });

    if (req.user.group) {
      return res.status(400).json({ message: 'You have already joined a group' });
    }

    const group = await Group.findOne({ code: code.toUpperCase() });
    if (!group) return res.status(404).json({ message: 'Invalid group code' });

    const existingMember = await Member.findOne({ group: group._id, mobile: req.user.mobile });
    if (existingMember) {
      return res.status(409).json({ message: 'A join request for this group already exists' });
    }

    const member = await Member.create({
      group: group._id,
      user: req.user._id,
      name: req.user.name,
      mobile: req.user.mobile,
      aadhaar: aadhaar || null,
      address: address || '',
      status: 'pending',
    });

    return res.status(201).json({
      message: 'Join request submitted. Waiting for the group head to approve.',
      member,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error joining group' });
  }
};

// @route  GET /api/groups/:id/pending
// @desc   Head views pending join requests
// @access Private (head, must own the group)
const getPendingRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group head can view join requests' });
    }
    const pending = await Member.find({ group: group._id, status: 'pending' }).sort({ createdAt: -1 });
    return res.status(200).json({ pending });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching join requests' });
  }
};

// @route  PUT /api/groups/:id/approve/:memberId
// @desc   Head approves a pending member
// @access Private (head, must own the group)
const approveMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group head can approve members' });
    }

    const member = await Member.findOne({ _id: req.params.memberId, group: group._id });
    if (!member) return res.status(404).json({ message: 'Member request not found' });

    member.status = 'active';
    await member.save();

    if (member.user) {
      await User.findByIdAndUpdate(member.user, { group: group._id });
    }

    return res.status(200).json({ message: 'Member approved', member });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error approving member' });
  }
};

// @route  DELETE /api/groups/:id/members/:memberId
// @desc   Head removes a member from the group
// @access Private (head, must own the group)
const removeMemberFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (String(group.head) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the group head can remove members' });
    }

    const member = await Member.findOne({ _id: req.params.memberId, group: group._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.status = 'removed';
    await member.save();

    if (member.user) {
      await User.findByIdAndUpdate(member.user, { group: null });
    }

    return res.status(200).json({ message: 'Member removed from group' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error removing member' });
  }
};

module.exports = {
  createGroup,
  getMyGroup,
  lookupGroupByCode,
  updateGroup,
  joinGroup,
  getPendingRequests,
  approveMember,
  removeMemberFromGroup,
};
