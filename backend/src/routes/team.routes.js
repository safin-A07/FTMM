const express = require('express');
const router = express.Router();
const { getTeams, createTeams } = require('../controllers/teamController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:matchId', protect, getTeams);
router.post('/:matchId', protect, adminOnly, createTeams);

module.exports = router;
