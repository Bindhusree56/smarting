const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const {
  getMyFines,
} = require('../controllers/fineControllers');

router.get(
  '/my',
  protect,
  requireRole('member'),
  getMyFines
);

module.exports = router;