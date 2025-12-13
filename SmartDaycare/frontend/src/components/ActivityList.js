// src/components/ActivityList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityList = ({ type, staffId, childId, filter = 'all' }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActivities();
    }, [type, staffId, childId, filter]);

    const fetchActivities = async () => {
        setLoading(true);
        setError('');

        try {
            let url = '';
            if (type === 'staff') {
                url = `http://localhost:5560/api/activities/staff/${staffId}`;
                if (filter !== 'all') {
                    url += `?type=${filter}`;
                }
            } else {
                url = `http://localhost:5560/api/activities/parent/${childId}`;
                if (filter !== 'all') {
                    url += `?filter=${filter}`;
                }
            }

            const response = await axios.get(url);

            if (response.data.success) {
                setActivities(response.data.data || []);
            } else {
                setError('Failed to fetch activities');
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activities. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'meal': return '🍽️';
            case 'nap': return '😴';
            case 'activity': return '🎨';
            default: return '📝';
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'meal': return '#10b981';
            case 'nap': return '#8b5cf6';
            case 'activity': return '#f59e0b';
            default: return '#3b82f6';
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
            }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            <p>Loading activities...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container" style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
            <p style={{ marginBottom: '10px' }}>{error}</p>
            <button
            onClick={fetchActivities}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
            Retry
            </button>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="no-activities" style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontStyle: 'italic'
            }}>
            <p>No activities found.</p>
            {type === 'staff' && (
                <p>Create your first activity log above! 👆</p>
            )}
            </div>
        );
    }

    return (
        <div className="activities-list">
        {activities.map(activity => (
            <div key={activity._id} className="activity-card">
            <div className="activity-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="activity-type" style={{
                padding: '6px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backgroundColor: getTypeColor(activity.type) + '20',
                                     color: getTypeColor(activity.type),
                                     border: `1px solid ${getTypeColor(activity.type)}`
            }}>
            {getTypeIcon(activity.type)} {activity.type}
            </span>
            {activity.details?.mealType && (
                <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#10b98120',
                    color: '#059669'
                }}>
                {activity.details.mealType}
                </span>
            )}
            </div>
            <div className="activity-time" style={{
                color: '#6b7280',
                fontSize: '14px',
                fontFamily: 'monospace'
            }}>
            {formatDate(activity.timestamp)}
            </div>
            </div>

            <h3 className="activity-title" style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                margin: '15px 0 10px 0',
                color: '#1f2937'
            }}>
            {activity.title}
            </h3>

            <div className="activity-description" style={{
                color: '#4b5563',
                lineHeight: '1.6',
                marginBottom: '15px',
                whiteSpace: 'pre-wrap'
            }}>
            {activity.description}
            </div>

            {/* Activity Details */}
            {activity.details && (
                <div className="activity-details" style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                                  padding: '15px',
                                  borderRadius: '8px',
                                  margin: '15px 0',
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                  gap: '10px'
                }}>
                {activity.details.mealType && activity.details.mealType !== '' && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                                                   borderRadius: '6px',
                                                                                   fontSize: '0.9rem'
                    }}>
                    <strong>Meal:</strong> {activity.details.mealType}
                    </div>
                )}
                {activity.details.foodItems && activity.details.foodItems.length > 0 && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                                                         borderRadius: '6px',
                                                                                         fontSize: '0.9rem'
                    }}>
                    <strong>Food:</strong> {activity.details.foodItems.join(', ')}
                    </div>
                )}
                {activity.details.quantity && activity.details.quantity !== '' && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                                                   borderRadius: '6px',
                                                                                   fontSize: '0.9rem'
                    }}>
                    <strong>Ate:</strong> {activity.details.quantity}
                    </div>
                )}
                {activity.details.napDuration && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                  borderRadius: '6px',
                                                  fontSize: '0.9rem'
                    }}>
                    <strong>Duration:</strong> {activity.details.napDuration} minutes
                    </div>
                )}
                {activity.details.mood && activity.details.mood !== '' && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                                           borderRadius: '6px',
                                                                           fontSize: '0.9rem'
                    }}>
                    <strong>Mood:</strong> {activity.details.mood}
                    </div>
                )}
                {activity.details.activityType && activity.details.activityType !== '' && (
                    <div className="detail-item" style={{
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                                                                                           borderRadius: '6px',
                                                                                           fontSize: '0.9rem'
                    }}>
                    <strong>Activity Type:</strong> {activity.details.activityType}
                    </div>
                )}
                </div>
            )}

            {/* Photos */}
            {activity.photos && activity.photos.length > 0 && (
                <div className="photos-section">
                <h4 style={{
                    margin: '15px 0 10px 0',
                    color: '#4a5568',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                <span>📸</span> Photos ({activity.photos.length})
                </h4>
                <div className="photos-container" style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '10px',
                    overflowX: 'auto',
                    padding: '10px 5px'
                }}>
                {activity.photos.map((photo, index) => (
                    <img
                    key={index}
                    src={`http://localhost:5560${photo}`}
                    alt={`Activity ${index + 1}`}
                    className="photo-thumbnail"
                    style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => window.open(`http://localhost:5560${photo}`, '_blank')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                ))}
                </div>
                </div>
            )}

            <div className="activity-footer" style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                                     fontSize: '0.9rem',
                                     color: '#6b7280'
            }}>
            <span className="staff-info">
            👤 Staff ID: {activity.staffId}
            </span>
            <span className="child-info">
            👶 Child ID: {activity.childId}
            </span>
            </div>
            </div>
        ))}
        </div>
    );
};

export default ActivityList;
