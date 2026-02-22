const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
    },
    teamA: {
        name: { type: String, default: 'Team A' },
        color: { type: String, default: '#39FF14' },
        players: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            position: {
                type: String,
                enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'],
                default: 'Midfielder',
            },
            positionCoords: {
                x: { type: Number, default: 50 },
                y: { type: Number, default: 50 },
            },
        }],
    },
    teamB: {
        name: { type: String, default: 'Team B' },
        color: { type: String, default: '#3B82F6' },
        players: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            position: {
                type: String,
                enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'],
                default: 'Midfielder',
            },
            positionCoords: {
                x: { type: Number, default: 50 },
                y: { type: Number, default: 50 },
            },
        }],
    },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
