const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');

// Create activity (staff only) - protect and you can optionally check role in middleware or controller
router.post('/', protect, activityController.createActivity);

// Upload photos (staff)
router.post('/:id/photos', protect, upload.array('photos', 5), activityController.uploadPhotos);

// Get activities for a child (parent or staff)
router.get('/child/:childId', protect, activityController.getActivitiesByChild);

// Get today's summary for a child (parent)
router.get('/summary/:childId', protect, activityController.getTodaySummary);

module.exports = router;
