const express = require('express');
const router = express.Router();
const {
    getMatches, getMatchById, createMatch, joinMatch, leaveMatch, updateMatch, deleteMatch
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getMatches);
router.get('/:id', protect, getMatchById);
router.post('/', protect, adminOnly, createMatch);
router.put('/:id', protect, adminOnly, updateMatch);
router.delete('/:id', protect, adminOnly, deleteMatch);
router.post('/:id/join', protect, joinMatch);
router.post('/:id/leave', protect, leaveMatch);

module.exports = router;
