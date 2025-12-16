import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get notifications for a parent
router.get('/parent/:parentId', async (req, res) => {
    try {
        const { parentId } = req.params;
        const { read, limit = 50, type } = req.query;
        
        const query = { parentId };
        if (read !== undefined) query.read = read === 'true';
        if (type && type !== 'all') query.type = type;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        const unreadCount = await Notification.countDocuments({ 
            parentId, 
            read: false 
        });
        
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                total: notifications.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read for a parent
router.put('/parent/:parentId/read-all', async (req, res) => {
    try {
        const { parentId } = req.params;
        const result = await Notification.updateMany(
            { parentId, read: false },
            { read: true }
        );
        
        res.json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read`,
            data: { modifiedCount: result.modifiedCount }
        });
        
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read'
        });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
});

// Create notification
router.post('/', async (req, res) => {
    try {
        const { parentId, childId, type, title, message, priority, activityId, metadata } = req.body;
        
        if (!parentId || !childId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const notification = new Notification({
            parentId,
            childId,
            type,
            title,
            message,
            priority: priority || 'medium',
            activityId,
            metadata: metadata || {}
        });
        
        await notification.save();
        console.log(`📢 Notification created for parent ${parentId}: ${title}`);
        
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
        
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
});

// Get notification stats
router.get('/parent/:parentId/stats', async (req, res) => {
    try {
        const { parentId } = req.params;
        
        const stats = await Notification.aggregate([
            { $match: { parentId } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } }
                }
            }
        ]);
        
        const total = await Notification.countDocuments({ parentId });
        const unreadTotal = await Notification.countDocuments({ 
            parentId, 
            read: false 
        });
        
        res.json({
            success: true,
            data: {
                stats,
                total,
                unreadTotal
            }
        });
        
    } catch (error) {
        console.error('Error fetching notification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notification stats'
        });
    }
});

export default router;