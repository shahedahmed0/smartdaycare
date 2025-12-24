import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    senderRole: {
        type: String,
        required: true,
        enum: ['parent', 'staff']
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
    readBy: [{
        userId: String,
        readAt: Date
    }],
    attachments: [{
        type: String,
        url: String,
        filename: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ chatId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;