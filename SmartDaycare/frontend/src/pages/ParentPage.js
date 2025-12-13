import React, { useState } from 'react';
import ActivityList from '../components/ActivityList';

const ParentPage = ({ childId }) => {
    const [filter, setFilter] = useState('all');

    return (
        <div>
        <div className="summary-card">
        <h2>📊 Today's Summary for Child {childId}</h2>
        <p>Get an overview of your child's day</p>
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

// Update the SummarySection component in ParentPage.js

const SummarySection = ({ childId }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    React.useEffect(() => {
        fetchSummary();
    }, [childId]);

    const fetchSummary = async () => {
        try {
            const response = await fetch(`http://localhost:5560/api/activities/summary/${childId}`);
            const data = await response.json();

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

    if (loading) return <div className="loading">Loading today's summary...</div>;

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="summary-grid">
        <div className="summary-item">
        <div className="summary-value">{summary?.total || 0}</div>
        <div className="summary-label">Total Activities</div>
        </div>
        <div className="summary-item">
        <div className="summary-value">{summary?.meals || 0}</div>
        <div className="summary-label">Meals</div>
        </div>
        <div className="summary-item">
        <div className="summary-value">{summary?.naps || 0}</div>
        <div className="summary-label">Naps</div>
        </div>
        <div className="summary-item">
        <div className="summary-value">{summary?.photos || 0}</div>
        <div className="summary-label">Photos</div>
        </div>
        </div>
    );
};

export default ParentPage;
