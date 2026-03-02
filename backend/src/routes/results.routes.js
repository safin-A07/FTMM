const express = require('express');
const router = express.Router();
const {
    saveResult,
    publishResult,
    getMatchHistory
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/results/history/timeline
router.get('/history/timeline', protect, getMatchHistory);

// @route   POST /api/results/:id
router.post('/:id', protect, adminOnly, saveResult);

// @route   PUT /api/results/:id/publish
router.put('/:id/publish', protect, adminOnly, publishResult);

module.exports = router;
