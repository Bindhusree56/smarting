const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const {
  saveAttendance,
  getMeetingAttendance,
  getMyAttendance,
} = require('../controllers/attendanceController');


router.post(
  '/',
  protect,
  requireRole('head'),
  saveAttendance
);


router.get(
  '/meeting/:meetingId',
  protect,
  getMeetingAttendance
);


router.get(
  '/my',
  protect,
  requireRole('member'),
  getMyAttendance
);


module.exports = router;