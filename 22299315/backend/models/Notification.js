import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    parentId: {
        type: String,
        required: true
    },
    childId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['activity', 'reminder', 'emergency', 'payment', 'system']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        timestamp: {
            type: Date,
            default: Date.now
        },
        source: String,
        actionUrl: String
    }
}, {
    timestamps: true
});

notificationSchema.index({ parentId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ childId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;