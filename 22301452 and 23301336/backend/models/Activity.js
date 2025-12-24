const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  activityType: {
    type: String,
    enum: ['meal', 'nap', 'activity', 'update'],
    required: true
  },
  title: { type: String },
  description: { type: String, default: '' },
  date: {
    type: Date,
    default: Date.now
  },
  photos: [{ type: String }], // store URLs (e.g. /uploads/...)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meta: {
    // optional extra fields from your JSON structure
    mood: String,
    notes: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
