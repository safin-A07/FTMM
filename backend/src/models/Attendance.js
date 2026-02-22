const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['arrived', 'late', 'absent', 'pending'],
        default: 'pending',
    },
    markedAt: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
