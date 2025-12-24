const Activity = require('../models/Activity');
const Child = require('../models/Child');
const path = require('path');

// Create new activity (staff)
exports.createActivity = async (req, res) => {
  try {
    const { childId, activityType, title, description, meta } = req.body;

    // validate child exists
    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });

    const activity = await Activity.create({
      child: child._id,
      activityType,
      title,
      description,
      meta,
      createdBy: req.user ? req.user._id : undefined
    });

    res.status(201).json({ success: true, message: 'Activity created', data: activity });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Upload photos to an activity
exports.uploadPhotos = async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    const files = req.files || [];
    const photoUrls = files.map(f => `/uploads/${path.basename(f.path)}`);

    activity.photos = activity.photos.concat(photoUrls);
    await activity.save();

    res.json({ success: true, message: 'Photos uploaded', photos: photoUrls, data: activity });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get activities for a child with filters
exports.getActivitiesByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const { type, date } = req.query;

    const query = { child: childId };
    if (type && type !== 'all') query.activityType = type;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const activities = await Activity.find(query).sort({ date: -1 });
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Today's summary
exports.getTodaySummary = async (req, res) => {
  try {
    const { childId } = req.params;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayActivities = await Activity.find({
      child: childId,
      date: { $gte: start, $lte: end }
    });

    const summary = {
      meals: todayActivities.filter(a => a.activityType === 'meal'),
      naps: todayActivities.filter(a => a.activityType === 'nap'),
      activities: todayActivities.filter(a => a.activityType === 'activity'),
      updates: todayActivities.filter(a => a.activityType === 'update'),
      total: todayActivities.length,
      photos: todayActivities.filter(a => (a.photos || []).length > 0).length
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
