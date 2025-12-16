import Notification from '../models/Notification.js';

class NotificationService {
    static async createActivityNotification(staffId, childId, activity) {
        try {
            const parentId = this.getParentIdByChildId(childId);
            if (!parentId) {
                console.warn(`No parent found for child ${childId}`);
                return null;
            }
            
            const notification = new Notification({
                parentId,
                childId,
                type: 'activity',
                title: `New ${activity.type} Activity`,
                message: `${activity.title} - ${activity.description.substring(0, 80)}...`,
                priority: this.getPriorityByActivityType(activity.type),
                activityId: activity._id,
                metadata: {
                    source: 'staff',
                    staffId: staffId,
                    timestamp: new Date()
                }
            });
            
            await notification.save();
            console.log(`📢 Activity notification created for parent ${parentId}`);
            return notification;
        } catch (error) {
            console.error('Error creating activity notification:', error);
            return null;
        }
    }
    
    static async createEmergencyNotification(childId, emergencyType, details, symptoms, severity) {
        try {
            const parentId = this.getParentIdByChildId(childId);
            if (!parentId) {
                console.warn(`No parent found for child ${childId}`);
                return null;
            }
            
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
            console.log(`🚨 Emergency notification created for parent ${parentId}`);
            return notification;
        } catch (error) {
            console.error('Error creating emergency notification:', error);
            return null;
        }
    }
    
    static async createPickupReminder(childId, pickupTime) {
        try {
            const parentId = this.getParentIdByChildId(childId);
            if (!parentId) {
                console.warn(`No parent found for child ${childId}`);
                return null;
            }
            
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
            console.log(`⏰ Pickup reminder created for parent ${parentId}`);
            return notification;
        } catch (error) {
            console.error('Error creating pickup reminder:', error);
            return null;
        }
    }
    
    static getParentIdByChildId(childId) {
        const childParentMap = {
            'CHILD001': 'PARENT001',
            'CHILD002': 'PARENT002'
        };
        return childParentMap[childId] || 'PARENT001';
    }
    
    static getPriorityByActivityType(activityType) {
        const priorityMap = {
            'update': 'medium',
            'meal': 'low',
            'nap': 'low',
            'activity': 'low'
        };
        return priorityMap[activityType] || 'low';
    }
}

export default NotificationService;