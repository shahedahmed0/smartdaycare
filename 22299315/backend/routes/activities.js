import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Activity from '../models/Activity.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = join(file.originalname).split('.').pop();
        cb(null, 'activity-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(join(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
});

// CREATE Activity - Staff uploads daily logs with photos
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        const { staffId, childId, type, title, description, ...details } = req.body;
        
        // Validate required fields
        if (!staffId || !childId || !type || !title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get photo paths
        const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        // Create activity
        const activity = new Activity({
            staffId,
            childId,
            type,
            title,
            description,
            photos: photoPaths,
            details: {
                mealType: details.mealType || '',
                napDuration: details.napDuration ? parseInt(details.napDuration) : undefined,
                activityType: details.activityType || '',
                mood: details.mood || '',
                foodItems: details.foodItems ? details.foodItems.split(',').map(item => item.trim()) : [],
                quantity: details.quantity || ''
            }
        });

        await activity.save();

        // Create notification for parent
        try {
            await NotificationService.createActivityNotification(staffId, childId, activity);
        } catch (notificationError) {
            console.warn('Failed to create notification:', notificationError);
            // Don't fail the activity creation
        }

        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            data: activity
        });

    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create activity',
            error: error.message
        });
    }
});

// READ Activities for Staff - Get their activity history
router.get('/staff/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;
        const { type, limit = 20 } = req.query;
        
        // Build query
        const query = { staffId };
        if (type && type !== 'all') {
            query.type = type;
        }

        // Get activities
        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });

    } catch (error) {
        console.error('Error fetching staff activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities'
        });
    }
});

// READ Activities for Parent - View child's activities
router.get('/parent/:childId', async (req, res) => {
    try {
        const { childId } = req.params;
        const { filter = 'all', limit = 50 } = req.query;
        
        // Build query
        const query = { childId };
        if (filter && filter !== 'all') {
            query.type = filter;
        }

        // Get activities
        const activities = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });

    } catch (error) {
        console.error('Error fetching parent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities'
        });
    }
});

// READ Daily Summary for Child
router.get('/summary/:childId', async (req, res) => {
    try {
        const { childId } = req.params;
        
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get today's activities
        const activities = await Activity.find({
            childId,
            timestamp: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Calculate summary
        const meals = activities.filter(a => a.type === 'meal');
        const naps = activities.filter(a => a.type === 'nap');
        const photoCount = activities.reduce((total, activity) => total + (activity.photos?.length || 0), 0);

        res.json({
            success: true,
            data: {
                total: activities.length,
                meals: meals.length,
                naps: naps.length,
                photos: photoCount,
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary'
        });
    }
});

// DELETE Activity
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const activity = await Activity.findByIdAndDelete(id);
        
        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Activity deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete activity'
        });
    }
});

// Emergency alert endpoint
router.post('/:childId/emergency', async (req, res) => {
    try {
        const { childId } = req.params;
        const { staffId, emergencyType, details, symptoms, severity } = req.body;
        
        const notification = await NotificationService.createEmergencyNotification(
            childId,
            emergencyType,
            details,
            symptoms,
            severity
        );
        
        res.json({
            success: true,
            message: 'Emergency notification sent to parent',
            data: notification
        });
        
    } catch (error) {
        console.error('Error creating emergency notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send emergency notification'
        });
    }
});

// Pickup reminder endpoint
router.post('/:childId/pickup-reminder', async (req, res) => {
    try {
        const { childId } = req.params;
        const { pickupTime } = req.body;
        
        const notification = await NotificationService.createPickupReminder(
            childId,
            pickupTime
        );
        
        res.json({
            success: true,
            message: 'Pickup reminder scheduled',
            data: notification
        });
        
    } catch (error) {
        console.error('Error creating pickup reminder:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule pickup reminder'
        });
    }
});

export default router;