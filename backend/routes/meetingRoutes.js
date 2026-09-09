const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const {
  createMeeting,
  getMeetings,
  getMeetingById,
  completeMeeting,
} = require('../controllers/meetingController');


router.post(
  '/',
  protect,
  requireRole('head'),
  createMeeting
);


router.get(
  '/',
  protect,
  getMeetings
);


router.get(
  '/:id',
  protect,
  getMeetingById
);


router.put(
  '/:id/complete',
  protect,
  requireRole('head'),
  completeMeeting
);


module.exports = router;