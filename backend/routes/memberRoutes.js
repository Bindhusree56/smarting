const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  addMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

router.use(protect, requireRole('head'));

router.post('/', addMember);
router.get('/', getMembers);
router.get('/:id', getMemberById);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
