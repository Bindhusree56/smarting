const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  createGroup,
  getMyGroup,
  lookupGroupByCode,
  updateGroup,
  joinGroup,
  getPendingRequests,
  approveMember,
  removeMemberFromGroup,
} = require('../controllers/groupController');

router.post('/', protect, requireRole('head'), createGroup);
router.get('/mine', protect, getMyGroup);
router.get('/lookup/:code', protect, requireRole('member'), lookupGroupByCode);
router.put('/:id', protect, requireRole('head'), updateGroup);
router.post('/join', protect, requireRole('member'), joinGroup);
router.get('/:id/pending', protect, requireRole('head'), getPendingRequests);
router.put('/:id/approve/:memberId', protect, requireRole('head'), approveMember);
router.delete('/:id/members/:memberId', protect, requireRole('head'), removeMemberFromGroup);

module.exports = router;
