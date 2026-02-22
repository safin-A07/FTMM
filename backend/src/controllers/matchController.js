const Match = require('../models/Match');
const Notification = require('../models/Notification');

// @desc    Get all upcoming matches
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
    try {
        const matches = await Match.find({ status: { $in: ['upcoming', 'ongoing'] } })
            .populate('joinedPlayers', 'name position profileImage')
            .populate('waitingList', 'name position profileImage')
            .populate('createdBy', 'name')
            .sort({ date: 1 });

        res.json({ success: true, count: matches.length, matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Private
const getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('joinedPlayers', 'name position profileImage email')
            .populate('waitingList', 'name position profileImage email')
            .populate('createdBy', 'name email');

        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }
        res.json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const User = require('../models/User');
const sendEmail = require('../services/emailService');

// @desc    Create a match
// @route   POST /api/matches
// @access  Admin
const createMatch = async (req, res) => {
    try {
        const { title, date, time, location, maxPlayers, joinDeadline, notes, matchFee } = req.body;
        const match = await Match.create({
            title, date, time, location, maxPlayers, joinDeadline, notes, matchFee,
            createdBy: req.user.id,
        });

        // Send email notifications to all registered users
        const users = await User.find({}, 'email name');
        const matchDate = new Date(date).toLocaleDateString();

        const emailPromises = users.map(user => {
            return sendEmail({
                to: user.email,
                subject: `⚽ New Match Posted: ${title}`,
                message: `
                    <h1>New Match Alert!</h1>
                    <p>Hi ${user.name},</p>
                    <p>A new match has been posted on FTMM!</p>
                    <ul>
                        <li><strong>Match:</strong> ${title}</li>
                        <li><strong>Date:</strong> ${matchDate}</li>
                        <li><strong>Time:</strong> ${time}</li>
                        <li><strong>Location:</strong> ${location.name}</li>
                        <li><strong>Fee:</strong> ${matchFee || 'Not specified'} TK</li>
                    </ul>
                    <p>Log in now to join the match!</p>
                    <a href="${process.env.CLIENT_URL}" style="background-color: #39FF14; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Join Match</a>
                `
            }).catch(err => console.error(`Failed to send email to ${user.email}:`, err.message));
        });

        // Don't wait for all emails to complete before responding to admin, but trigger them
        Promise.all(emailPromises);

        res.status(201).json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Join a match
// @route   POST /api/matches/:id/join
// @access  Private
const joinMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const userId = req.user.id;

        // Check if already joined or in waiting list
        const alreadyJoined = match.joinedPlayers.includes(userId);
        const inWaitingList = match.waitingList.includes(userId);

        if (alreadyJoined || inWaitingList) {
            return res.status(400).json({ success: false, message: 'You have already joined or are on the waiting list' });
        }

        let status;
        if (match.joinedPlayers.length < match.maxPlayers) {
            match.joinedPlayers.push(userId);
            status = 'joined';
        } else {
            match.waitingList.push(userId);
            status = 'waitlisted';
        }

        await match.save();
        await match.populate('joinedPlayers', 'name position profileImage');
        await match.populate('waitingList', 'name position profileImage');

        // Emit to all connected clients via socket (attached to req.app)
        const io = req.app.get('io');
        if (io) {
            io.to(`match_${match._id}`).emit('match_updated', match);
        }

        res.json({ success: true, status, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Leave a match
// @route   POST /api/matches/:id/leave
// @access  Private
const leaveMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }

        const userId = req.user.id.toString();
        const joinedIdx = match.joinedPlayers.findIndex(p => p.toString() === userId);
        const waitingIdx = match.waitingList.findIndex(p => p.toString() === userId);

        if (joinedIdx === -1 && waitingIdx === -1) {
            return res.status(400).json({ success: false, message: 'You are not in this match' });
        }

        if (joinedIdx !== -1) {
            match.joinedPlayers.splice(joinedIdx, 1);
            // Promote first waiting player
            if (match.waitingList.length > 0) {
                const promotedId = match.waitingList.shift();
                match.joinedPlayers.push(promotedId);

                // Create notification for promoted player
                await Notification.create({
                    recipient: promotedId,
                    title: '🎉 You\'re In!',
                    message: `A spot opened up! You've been promoted from the waiting list for "${match.title}".`,
                    type: 'waitlist_promoted',
                    match: match._id,
                });
            }
        } else {
            match.waitingList.splice(waitingIdx, 1);
        }

        await match.save();
        await match.populate('joinedPlayers', 'name position profileImage');
        await match.populate('waitingList', 'name position profileImage');

        const io = req.app.get('io');
        if (io) io.to(`match_${match._id}`).emit('match_updated', match);

        res.json({ success: true, message: 'Left match successfully', match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update match (Admin)
// @route   PUT /api/matches/:id
// @access  Admin
const updateMatch = async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete match (Admin)
// @route   DELETE /api/matches/:id
// @access  Admin
const deleteMatch = async (req, res) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMatches, getMatchById, createMatch, joinMatch, leaveMatch, updateMatch, deleteMatch };
