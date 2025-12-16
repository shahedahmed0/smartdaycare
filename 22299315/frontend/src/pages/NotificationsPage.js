import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [parentId] = useState('PARENT001');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [parentId, filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5560/api/notifications/parent/${parentId}`;
            if (filter !== 'all') {
                url += `?type=${filter}`;
            }
            
            const response = await axios.get(url);
            if (response.data.success) {
                setNotifications(response.data.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`http://localhost:5560/api/notifications/parent/${parentId}/stats`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notification stats:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5560/api/notifications/${notificationId}/read`);
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`http://localhost:5560/api/notifications/parent/${parentId}/read-all`);
            fetchNotifications();
            fetchStats();
            alert('All notifications marked as read!');
        } catch (error) {
            console.error('Error marking all as read:', error);
            alert('Failed to mark all as read. Please try again.');
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) return;
        
        try {
            await axios.delete(`http://localhost:5560/api/notifications/${notificationId}`);
            fetchNotifications();
            fetchStats();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Failed to delete notification. Please try again.');
        }
    };

    const clearAllNotifications = async () => {
        if (!window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return;
        
        try {
            // Delete all notifications one by one (in a real app, you'd have a bulk delete endpoint)
            const deletePromises = notifications.map(notification => 
                axios.delete(`http://localhost:5560/api/notifications/${notification._id}`)
            );
            await Promise.all(deletePromises);
            fetchNotifications();
            fetchStats();
            alert('All notifications cleared!');
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            alert('Failed to clear notifications. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
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

    const getPriorityBadge = (priority) => {
        const colors = {
            urgent: '#ef4444',
            high: '#f97316',
            medium: '#eab308',
            low: '#3b82f6'
        };
        
        return (
            <span className="priority-badge" style={{
                backgroundColor: colors[priority] + '20',
                color: colors[priority],
                borderColor: colors[priority]
            }}>
                {priority}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        const icons = {
            activity: '📝',
            reminder: '⏰',
            emergency: '🚨',
            payment: '💰',
            system: '🔧'
        };
        
        return icons[type] || '🔔';
    };

    const getTypeLabel = (type) => {
        const labels = {
            activity: 'Activity Update',
            reminder: 'Reminder',
            emergency: 'Emergency Alert',
            payment: 'Payment',
            system: 'System'
        };
        
        return labels[type] || 'Notification';
    };

    const getTypeColor = (type) => {
        const colors = {
            activity: '#3b82f6',
            reminder: '#f59e0b',
            emergency: '#ef4444',
            payment: '#10b981',
            system: '#6b7280'
        };
        
        return colors[type] || '#6b7280';
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="notifications-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            {/* Header Section */}
            <div className="notifications-header">
                <div>
                    <button 
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                    <h1>
                        <span className="notification-icon-header">🔔</span>
                        Notifications
                    </h1>
                    <p className="subtitle">Stay updated with your child's activities and alerts</p>
                </div>
                
                <div className="header-actions">
                    {stats && (
                        <div className="notification-stats-badge">
                            <div className="stats-count">{stats.unreadTotal}</div>
                            <div className="stats-label">Unread</div>
                        </div>
                    )}
                    <button 
                        className="btn btn-primary"
                        onClick={markAllAsRead}
                        disabled={!stats || stats.unreadTotal === 0}
                    >
                        📌 Mark All as Read
                    </button>
                    <button 
                        className="btn btn-danger"
                        onClick={clearAllNotifications}
                        disabled={notifications.length === 0}
                    >
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="stats-overview">
                    <h3>Overview</h3>
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon">📊</div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total</div>
                        </div>
                        
                        <div className="stat-card unread">
                            <div className="stat-icon">🔴</div>
                            <div className="stat-value">{stats.unreadTotal}</div>
                            <div className="stat-label">Unread</div>
                        </div>
                        
                        {stats.stats.map(stat => (
                            <div 
                                key={stat.type} 
                                className="stat-card"
                                style={{ borderLeftColor: getTypeColor(stat.type) }}
                            >
                                <div className="stat-icon">{getTypeIcon(stat.type)}</div>
                                <div className="stat-value">{stat.count}</div>
                                <div className="stat-label">{getTypeLabel(stat.type)}</div>
                                {stat.unread > 0 && (
                                    <div className="stat-unread">{stat.unread} unread</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className="filter-section">
                <h3>Filter by Type</h3>
                <div className="filter-buttons">
                    {['all', 'activity', 'reminder', 'emergency'].map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                            style={filter === type ? { 
                                backgroundColor: getTypeColor(type === 'all' ? 'activity' : type),
                                color: 'white'
                            } : {}}
                        >
                            {type === 'all' ? '📋 All' :
                             type === 'activity' ? '📝 Activities' :
                             type === 'reminder' ? '⏰ Reminders' :
                             '🚨 Emergencies'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-content">
                <div className="notifications-list-header">
                    <h3>
                        {filter === 'all' ? 'All Notifications' :
                         filter === 'activity' ? 'Activity Updates' :
                         filter === 'reminder' ? 'Reminders' :
                         'Emergency Alerts'}
                        <span className="notification-count"> ({notifications.length})</span>
                    </h3>
                    <div className="sort-options">
                        <select className="sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="priority">Priority (High to Low)</option>
                        </select>
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <h3>No notifications yet</h3>
                        <p>
                            {filter === 'all' 
                                ? "You'll see notifications here when staff post updates or send alerts."
                                : `No ${filter} notifications found.`}
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setFilter('all')}
                        >
                            View All Notifications
                        </button>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div 
                                key={notification._id}
                                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                            >
                                <div className="notification-card-header">
                                    <div className="notification-type">
                                        <span 
                                            className="type-icon"
                                            style={{ color: getTypeColor(notification.type) }}
                                        >
                                            {getTypeIcon(notification.type)}
                                        </span>
                                        <span className="type-label">
                                            {getTypeLabel(notification.type)}
                                        </span>
                                        {!notification.read && (
                                            <span className="unread-indicator">NEW</span>
                                        )}
                                    </div>
                                    <div className="notification-actions">
                                        {!notification.read && (
                                            <button
                                                className="action-btn mark-read"
                                                onClick={() => markAsRead(notification._id)}
                                                title="Mark as read"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            className="action-btn delete"
                                            onClick={() => deleteNotification(notification._id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="notification-card-body">
                                    <h4 className="notification-title">
                                        {notification.title}
                                    </h4>
                                    <p className="notification-message">
                                        {notification.message}
                                    </p>
                                    
                                    {notification.metadata && (
                                        <div className="notification-metadata">
                                            {notification.metadata.symptoms && (
                                                <div className="metadata-item">
                                                    <strong>Symptoms:</strong> {notification.metadata.symptoms}
                                                </div>
                                            )}
                                            {notification.metadata.severity && (
                                                <div className="metadata-item">
                                                    <strong>Severity:</strong> 
                                                    <span className={`severity-badge severity-${notification.metadata.severity}`}>
                                                        {notification.metadata.severity}
                                                    </span>
                                                </div>
                                            )}
                                            {notification.metadata.emergencyType && (
                                                <div className="metadata-item">
                                                    <strong>Type:</strong> {notification.metadata.emergencyType}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="notification-card-footer">
                                    <div className="notification-info">
                                        <span className="time-info" title={formatDate(notification.createdAt)}>
                                            ⏰ {formatRelativeTime(notification.createdAt)}
                                        </span>
                                        <span className="child-info">
                                            👶 Child: {notification.childId}
                                        </span>
                                        {notification.priority && notification.priority !== 'medium' && (
                                            <span className="priority-info">
                                                {getPriorityBadge(notification.priority)}
                                            </span>
                                        )}
                                    </div>
                                    {notification.activityId && (
                                        <button 
                                            className="view-activity-btn"
                                            onClick={() => alert(`Would view activity: ${notification.activityId}`)}
                                        >
                                            View Activity →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Settings Section */}
            <div className="settings-section">
                <h3>Notification Settings</h3>
                <div className="settings-grid">
                    <div className="setting-item">
                        <label className="setting-label">
                            <input type="checkbox" defaultChecked />
                            <span>Activity Updates</span>
                        </label>
                        <p className="setting-description">Get notified when staff post new activities</p>
                    </div>
                    
                    <div className="setting-item">
                        <label className="setting-label">
                            <input type="checkbox" defaultChecked />
                            <span>Emergency Alerts</span>
                        </label>
                        <p className="setting-description">Urgent notifications for emergencies</p>
                    </div>
                    
                    <div className="setting-item">
                        <label className="setting-label">
                            <input type="checkbox" defaultChecked />
                            <span>Pickup Reminders</span>
                        </label>
                        <p className="setting-description">Reminders 30 minutes before pickup time</p>
                    </div>
                    
                    <div className="setting-item">
                        <label className="setting-label">
                            <input type="checkbox" defaultChecked />
                            <span>Daily Summaries</span>
                        </label>
                        <p className="setting-description">Daily report of your child's activities</p>
                    </div>
                </div>
                
                <div className="settings-actions">
                    <button className="btn btn-primary">
                        💾 Save Settings
                    </button>
                    <button className="btn">
                        🔔 Test Notification
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;