const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, initAttendance } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:matchId', protect, adminOnly, getAttendance);
router.post('/:matchId', protect, adminOnly, markAttendance);
router.post('/:matchId/init', protect, adminOnly, initAttendance);

module.exports = router;
