const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const {
  addContribution,
  getGroupContributions,
  getMemberContributions,
} = require('../controllers/contributionController');

// All contribution routes require login
router.use(protect);

// Head routes
router.post(
  '/',
  requireRole('head'),
  addContribution
);

router.get(
  '/',
  requireRole('head'),
  getGroupContributions
);

router.get(
  '/member/:memberId',
  requireRole('head'),
  getMemberContributions
);

module.exports = router;