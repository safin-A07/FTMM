const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Match title is required'],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Match date is required'],
    },
    time: {
        type: String,
        required: [true, 'Match time is required'],
    },
    endingTime: {
        type: String,
    },
    location: {
        name: { type: String, required: true },
        address: { type: String, default: '' },
        coordinates: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },
    },
    maxPlayers: {
        type: Number,
        required: true,
        min: 2,
        max: 30,
        default: 14,
    },
    joinDeadline: {
        type: Date,
    },
    notes: {
        type: String,
        default: '',
    },
    joinedPlayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    waitingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['draft', 'open', 'ongoing', 'finished'],
        default: 'draft',
    },
    matchFee: {
        type: Number,
        default: 0,
    },
    teamsPublished: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resultPublished: {
        type: Boolean,
        default: false,
    },
    result: {
        teamAScore: { type: Number, default: 0 },
        teamBScore: { type: Number, default: 0 },
        scorers: [{
            playerId: { type: String, default: '' },
            playerName: { type: String, default: '' },
            goals: { type: Number, default: 0 },
            assists: { type: Number, default: 0 },
            team: { type: String, enum: ['A', 'B'] }
        }],
        manOfTheMatch: {
            id: { type: String, default: null },
            name: { type: String, default: '' }
        },
        summary: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
