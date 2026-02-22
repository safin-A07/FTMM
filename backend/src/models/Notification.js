const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['match_created', 'player_joined', 'waitlist_promoted', 'teams_published', 'reminder', 'announcement'],
        default: 'announcement',
    },
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        default: null,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
