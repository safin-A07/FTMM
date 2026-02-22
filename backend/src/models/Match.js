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
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
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
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
