const Team = require('../models/Team');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

// @desc    Get teams for a match
// @route   GET /api/teams/:matchId
// @access  Private
const getTeams = async (req, res) => {
    try {
        const team = await Team.findOne({ match: req.params.matchId })
            .populate('teamA.players.user', 'name position profileImage')
            .populate('teamB.players.user', 'name position profileImage');

        if (!team) return res.status(404).json({ success: false, message: 'Teams not yet created' });
        res.json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create/publish teams (Admin)
// @route   POST /api/teams/:matchId
// @access  Admin
const createTeams = async (req, res) => {
    try {
        const { teamA, teamB } = req.body;
        const match = await Match.findById(req.params.matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        let team = await Team.findOne({ match: req.params.matchId });
        if (team) {
            team.teamA = teamA;
            team.teamB = teamB;
            await team.save();
        } else {
            team = await Team.create({ match: req.params.matchId, teamA, teamB });
        }

        match.teamsPublished = true;
        await match.save();

        // Notify all joined players
        const notifications = match.joinedPlayers.map(playerId => ({
            recipient: playerId,
            title: '📋 Teams Published!',
            message: `Teams for "${match.title}" have been published. Check your position!`,
            type: 'teams_published',
            match: match._id,
        }));
        await Notification.insertMany(notifications);

        const io = req.app.get('io');
        if (io) io.to(`match_${match._id}`).emit('teams_published', team);

        await team.populate('teamA.players.user', 'name position profileImage');
        await team.populate('teamB.players.user', 'name position profileImage');

        res.status(201).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeams, createTeams };
