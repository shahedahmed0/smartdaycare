import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import NotificationBell from '../components/NotificationBell/NotificationBell';

const ParentPage = ({ childId }) => {
    const [filter, setFilter] = useState('all');

    return (
        <div>
            <div className="summary-card">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px' 
                }}>
                    <div>
                        <h2>📊 Today's Summary for Child {childId}</h2>
                        <p>Get an overview of your child's day</p>
                    </div>
                    <NotificationBell parentId="PARENT001" />
                </div>
                <SummarySection childId={childId} />
            </div>

            <div className="activities-container">
                <h2>📋 Daily Activities</h2>

                <div className="filter-container">
                    {['all', 'meal', 'nap', 'activity', 'update'].map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                        >
                            {type === 'all' ? 'All Activities' :
                             type === 'meal' ? '🍽️ Meals' :
                             type === 'nap' ? '😴 Naps' :
                             type === 'activity' ? '🎨 Activities' : '📝 Updates'}
                        </button>
                    ))}
                </div>

                <ActivityList
                    type="parent"
                    childId={childId}
                    filter={filter}
                />
            </div>
        </div>
    );
};

const SummarySection = ({ childId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [today] = useState(new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));

    useEffect(() => {
        fetchSummary();
        
        // Refresh summary every 30 seconds to get updates
        const interval = setInterval(fetchSummary, 30000);
        return () => clearInterval(interval);
    }, [childId]);

    const fetchSummary = async () => {
        try {
            const response = await fetch(`http://localhost:5560/api/activities/summary/${childId}`);
            const data = await response.json();
            
            console.log('📊 Summary API Response:', data); // Debug log
            
            if (data.success) {
                setSummary(data.data);
            } else {
                setError('Failed to fetch summary');
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
            setError('Failed to load summary. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const refreshSummary = () => {
        setLoading(true);
        fetchSummary();
    };

    if (loading) {
        return (
            <div className="loading-summary">
                <div className="loading-spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #a18a8a',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px'
                }}></div>
                <p>Loading today's summary...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="error-summary" style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center'
            }}>
                <p style={{ marginBottom: '15px' }}>{error}</p>
                <button 
                    onClick={refreshSummary}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px' }}
                >
                    🔄 Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div>
                    <h3 style={{ color: '#4a5568', fontSize: '1rem', marginBottom: '5px' }}>
                        📅 {today}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Live updates every 30 seconds
                    </p>
                </div>
                <button 
                    onClick={refreshSummary}
                    className="btn"
                    style={{ 
                        padding: '8px 16px',
                        background: '#a18a8a',
                        color: 'white',
                        fontSize: '0.9rem'
                    }}
                    title="Refresh summary"
                >
                    🔄 Refresh
                </button>
            </div>

            <div className="summary-grid">
                <div className="summary-item" style={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white'
                }}>
                    <div className="summary-value" style={{ fontSize: '2.8rem' }}>
                        {summary?.total || 0}
                    </div>
                    <div className="summary-label">Today's Activities</div>
                    <div className="summary-subtitle" style={{ 
                        fontSize: '0.8rem', 
                        opacity: 0.9,
                        marginTop: '5px'
                    }}>
                        Total for today
                    </div>
                </div>
                
                <div className="summary-item" style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white'
                }}>
                    <div className="summary-value" style={{ fontSize: '2.8rem' }}>
                        {summary?.meals || 0}
                    </div>
                    <div className="summary-label">🍽️ Meals</div>
                    <div className="summary-subtitle" style={{ 
                        fontSize: '0.8rem', 
                        opacity: 0.9,
                        marginTop: '5px'
                    }}>
                        Breakfast, Lunch, Snacks
                    </div>
                </div>
                
                <div className="summary-item" style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white'
                }}>
                    <div className="summary-value" style={{ fontSize: '2.8rem' }}>
                        {summary?.naps || 0}
                    </div>
                    <div className="summary-label">😴 Naps</div>
                    <div className="summary-subtitle" style={{ 
                        fontSize: '0.8rem', 
                        opacity: 0.9,
                        marginTop: '5px'
                    }}>
                        Rest periods
                    </div>
                </div>
                
                <div className="summary-item" style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white'
                }}>
                    <div className="summary-value" style={{ fontSize: '2.8rem' }}>
                        {summary?.photos || 0}
                    </div>
                    <div className="summary-label">📸 Photos</div>
                    <div className="summary-subtitle" style={{ 
                        fontSize: '0.8rem', 
                        opacity: 0.9,
                        marginTop: '5px'
                    }}>
                        Memories captured
                    </div>
                </div>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && summary?.debug && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#6b7280'
                }}>
                    <details>
                        <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                            🔍 Debug Info
                        </summary>
                        <pre style={{ 
                            marginTop: '10px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            fontSize: '0.7rem'
                        }}>
                            {JSON.stringify(summary.debug, null, 2)}
                        </pre>
                    </details>
                </div>
            )}

            {/* Quick Stats */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px',
                marginTop: '25px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: '#10b981'
                    }}>
                        {summary?.meals || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Meals Today
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: '#8b5cf6'
                    }}>
                        {summary?.naps || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Naps Today
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: '#f59e0b'
                    }}>
                        {summary?.photos || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Photos Today
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentPage;
