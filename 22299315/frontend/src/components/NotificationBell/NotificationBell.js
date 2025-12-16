import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBell.css';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ parentId = 'PARENT001' }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [parentId]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:5560/api/notifications/parent/${parentId}?limit=10`);
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
                setUnreadCount(response.data.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5560/api/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`http://localhost:5560/api/notifications/parent/${parentId}/read-all`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`http://localhost:5560/api/notifications/${notificationId}`);
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'activity': return '📝';
            case 'reminder': return '⏰';
            case 'emergency': return '🚨';
            case 'payment': return '💰';
            default: return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'medium': return '#eab308';
            case 'low': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-container">
            <button 
                className="notification-bell"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications ({unreadCount} unread)</h3>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button 
                                    className="mark-all-read"
                                    onClick={markAllAsRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                            <button 
                                className="close-dropdown"
                                onClick={() => setShowDropdown(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="loading-notifications">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="no-notifications">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification._id}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    style={{
                                        borderLeftColor: getPriorityColor(notification.priority)
                                    }}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">
                                            {notification.title}
                                        </div>
                                        <div className="notification-message">
                                            {notification.message}
                                        </div>
                                        <div className="notification-meta">
                                            <span className="notification-time">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                            <span className="notification-priority">
                                                {notification.priority}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button 
                                                className="mark-read-btn"
                                                onClick={() => markAsRead(notification._id)}
                                                title="Mark as read"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button 
                                            className="delete-btn"
                                            onClick={() => deleteNotification(notification._id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="notification-footer">
                        <button 
  className="view-all-btn"
  onClick={() => {
    setShowDropdown(false);
    navigate('/notifications');
  }}
>
  View All Notifications
</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
