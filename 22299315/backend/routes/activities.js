import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

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

// CREATE Activity
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
            const parentId = 'PARENT001';
            const notification = new Notification({
                parentId,
                childId,
                type: 'activity',
                title: `New ${type} Activity`,
                message: `${title} - ${description.substring(0, 80)}...`,
                priority: type === 'update' ? 'medium' : 'low',
                activityId: activity._id,
                metadata: {
                    source: 'staff',
                    staffId: staffId,
                    timestamp: new Date()
                }
            });
            
            await notification.save();
            console.log(`📢 Notification created for parent ${parentId}`);
        } catch (notificationError) {
            console.warn('Failed to create notification:', notificationError);
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

// READ Activities for Staff
router.get('/staff/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;
        const { type, limit = 20 } = req.query;
        
        const query = { staffId };
        if (type && type !== 'all') {
            query.type = type;
        }

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

// READ Activities for Parent
router.get('/parent/:childId', async (req, res) => {
    try {
        const { childId } = req.params;
        const { filter = 'all', limit = 50 } = req.query;
        
        const query = { childId };
        if (filter && filter !== 'all') {
            query.type = filter;
        }

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

// READ Daily Summary for Child - FIXED VERSION
router.get('/summary/:childId', async (req, res) => {
    try {
        const { childId } = req.params;
        
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        console.log('📅 Summary Query:', {
            childId,
            date: today.toISOString().split('T')[0],
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString()
        });

        // Get today's activities - Check both timestamp and createdAt
        const activities = await Activity.find({
            childId,
            $or: [
                { timestamp: { $gte: startOfDay, $lte: endOfDay } },
                { createdAt: { $gte: startOfDay, $lte: endOfDay } }
            ]
        });

        console.log(`📊 Found ${activities.length} activities for today`);

        // Calculate summary
        const meals = activities.filter(a => a.type === 'meal');
        const naps = activities.filter(a => a.type === 'nap');
        
        // Count ALL photos from today's activities
        let photoCount = 0;
        activities.forEach(activity => {
            if (activity.photos && Array.isArray(activity.photos)) {
                photoCount += activity.photos.length;
            }
        });

        res.json({
            success: true,
            data: {
                total: activities.length,
                meals: meals.length,
                naps: naps.length,
                photos: photoCount,
                debug: {
                    activitiesToday: activities.length,
                    dateQueried: today.toISOString().split('T')[0],
                    mealActivities: meals.map(m => ({ title: m.title, type: m.type })),
                    napActivities: naps.map(n => ({ title: n.title, type: n.type }))
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
});

// Emergency alert endpoint
router.post('/:childId/emergency', async (req, res) => {
    try {
        const { childId } = req.params;
        const { staffId, emergencyType, details, symptoms, severity } = req.body;
        
        const parentId = 'PARENT001';
        const notification = new Notification({
            parentId,
            childId,
            type: 'emergency',
            title: `🚨 ${emergencyType === 'illness' ? 'Health Alert' : 'Emergency Alert'}`,
            message: emergencyType === 'illness' 
                ? `${childId}: ${symptoms}. Severity: ${severity}`
                : details,
            priority: 'urgent',
            metadata: {
                source: 'staff',
                emergencyType,
                symptoms,
                severity,
                timestamp: new Date()
            }
        });
        
        await notification.save();
        
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
        
        const parentId = 'PARENT001';
        const formattedTime = new Date(pickupTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const notification = new Notification({
            parentId,
            childId,
            type: 'reminder',
            title: `⏰ Pickup Reminder`,
            message: `Don't forget to pick up ${childId} at ${formattedTime}`,
            priority: 'high',
            metadata: {
                source: 'system',
                reminderType: 'pickup',
                pickupTime,
                timestamp: new Date()
            }
        });
        
        await notification.save();
        
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

// ADD THIS LINE AT THE END - MUST BE PRESENT
export default router;