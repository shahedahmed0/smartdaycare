import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    staffId: {
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
        enum: ['meal', 'nap', 'activity', 'update']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    photos: [{
        type: String,
        default: []
    }],
    // FIX: Use createdAt as timestamp for queries
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Add index for faster queries
    },
    details: {
        mealType: {
            type: String,
            enum: ['breakfast', 'lunch', 'snack', 'dinner', '']
        },
        napDuration: Number,
        activityType: {
            type: String,
            enum: ['indoor', 'outdoor', 'learning', 'creative', 'physical', '']
        },
        mood: {
            type: String,
            enum: ['happy', 'sleepy', 'cranky', 'peaceful', 'active', '']
        },
        foodItems: [String],
        quantity: {
            type: String,
            enum: ['all', 'most', 'half', 'little', 'none', '']
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
activitySchema.index({ staffId: 1, timestamp: -1 });
activitySchema.index({ childId: 1, timestamp: -1 });
activitySchema.index({ childId: 1, createdAt: -1 }); // Add index for createdAt

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;