const Attendance = require('../models/Attendance');
const Match = require('../models/Match');

// @desc    Get attendance for a match
// @route   GET /api/attendance/:matchId
// @access  Private
const getAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ match: req.params.matchId })
            .populate('user', 'name position profileImage');
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark attendance (Admin)
// @route   POST /api/attendance/:matchId
// @access  Admin
const markAttendance = async (req, res) => {
    try {
        const { userId, status } = req.body;
        let record = await Attendance.findOne({ match: req.params.matchId, user: userId });

        if (record) {
            record.status = status;
            record.markedAt = new Date();
            await record.save();
        } else {
            record = await Attendance.create({
                match: req.params.matchId,
                user: userId,
                status,
                markedAt: new Date(),
            });
        }

        await record.populate('user', 'name position profileImage');
        res.json({ success: true, record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Initialize attendance for all joined players
// @route   POST /api/attendance/:matchId/init
// @access  Admin
const initAttendance = async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        const records = await Promise.all(
            match.joinedPlayers.map(async (playerId) => {
                const existing = await Attendance.findOne({ match: match._id, user: playerId });
                if (!existing) {
                    return Attendance.create({ match: match._id, user: playerId, status: 'pending' });
                }
                return existing;
            })
        );
        res.json({ success: true, count: records.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAttendance, markAttendance, initAttendance };
