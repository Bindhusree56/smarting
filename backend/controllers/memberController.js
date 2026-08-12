const Member = require('../models/Member');
const Group = require('../models/Group');

// Helper: confirm the requesting user heads the given group
const assertOwnsGroup = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, status: 404, message: 'Group not found' };
  if (String(group.head) !== String(userId)) {
    return { ok: false, status: 403, message: 'Only the group head can manage members' };
  }
  return { ok: true, group };
};

// @route  POST /api/members
// @desc   Head directly adds a member (no login/join-code required for the member)
// @access Private (head)
const addMember = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(400).json({ message: 'You must create a group before adding members' });
    }
    const ownership = await assertOwnsGroup(req.user.group, req.user._id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const { name, mobile, aadhaar, address, joinDate } = req.body;
    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and mobile number are required' });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
    }
    if (aadhaar && !/^[0-9]{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits' });
    }

    const existing = await Member.findOne({ group: req.user.group, mobile });
    if (existing) {
      return res.status(409).json({ message: 'A member with this mobile number already exists in the group' });
    }

    const member = await Member.create({
      group: req.user.group,
      name,
      mobile,
      aadhaar: aadhaar || null,
      address: address || '',
      joinDate: joinDate || Date.now(),
      status: 'active',
    });

    return res.status(201).json({ message: 'Member added successfully', member });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error adding member' });
  }
};

// @route  GET /api/members
// @desc   List / search members of the head's group
// @query  search - matches name or mobile
// @query  status - active | pending | removed
// @access Private (head)
const getMembers = async (req, res) => {
  try {
    if (!req.user.group) {
      return res.status(200).json({ members: [] });
    }
    const ownership = await assertOwnsGroup(req.user.group, req.user._id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const { search, status } = req.query;
    const query = { group: req.user.group };
    if (status) query.status = status;
    else query.status = { $ne: 'removed' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ members, count: members.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching members' });
  }
};

// @route  GET /api/members/:id
// @access Private (head)
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const ownership = await assertOwnsGroup(member.group, req.user._id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    return res.status(200).json({ member });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching member' });
  }
};

// @route  PUT /api/members/:id
// @desc   Head edits a member's details
// @access Private (head)
const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const ownership = await assertOwnsGroup(member.group, req.user._id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    const { name, mobile, aadhaar, address, joinDate, status } = req.body;

    if (mobile && !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
    }
    if (aadhaar && !/^[0-9]{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Aadhaar must be exactly 12 digits' });
    }
    if (status && !['pending', 'active', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (name) member.name = name;
    if (mobile) member.mobile = mobile;
    if (aadhaar !== undefined) member.aadhaar = aadhaar || null;
    if (address !== undefined) member.address = address;
    if (joinDate) member.joinDate = joinDate;
    if (status) member.status = status;

    await member.save();
    return res.status(200).json({ message: 'Member updated successfully', member });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating member' });
  }
};

// @route  DELETE /api/members/:id
// @desc   Head removes a member (soft delete: status = removed)
// @access Private (head)
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const ownership = await assertOwnsGroup(member.group, req.user._id);
    if (!ownership.ok) return res.status(ownership.status).json({ message: ownership.message });

    member.status = 'removed';
    await member.save();

    return res.status(200).json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error removing member' });
  }
};

module.exports = { addMember, getMembers, getMemberById, updateMember, deleteMember };
