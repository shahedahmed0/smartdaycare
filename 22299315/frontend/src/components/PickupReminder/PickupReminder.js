import React, { useState } from 'react';
import axios from 'axios';

const PickupReminder = ({ childId }) => {
    const [showForm, setShowForm] = useState(false);
    const [pickupTime, setPickupTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`http://localhost:5560/api/activities/${childId}/pickup-reminder`, {
                pickupTime: new Date(pickupTime).toISOString()
            });

            if (response.data.success) {
                setMessage('✅ Pickup reminder scheduled successfully!');
                setTimeout(() => {
                    setShowForm(false);
                    setPickupTime('');
                }, 2000);
            }
        } catch (error) {
            console.error('Error scheduling pickup reminder:', error);
            setMessage('❌ Failed to schedule pickup reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDefaultTime = () => {
        const now = new Date();
        const today5PM = new Date(now);
        today5PM.setHours(17, 0, 0, 0);
        return today5PM.toISOString().slice(0, 16);
    };

    return (
        <div className="pickup-reminder-container">
            <button
                className="pickup-btn"
                onClick={() => setShowForm(!showForm)}
                style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: "'Texturina', serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                }}
            >
                ⏰ Schedule Pickup Reminder
            </button>

            {showForm && (
                <div className="pickup-form-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="pickup-form" style={{
                        background: '#dbbfbf',
                        padding: '30px',
                        borderRadius: '15px',
                        width: '400px',
                        maxWidth: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#1d4ed8', margin: 0 }}>⏰ Schedule Pickup Reminder</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#4a5568'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {message && (
                            <div style={{
                                padding: '10px',
                                background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                                color: message.includes('✅') ? '#065f46' : '#991b1b',
                                borderRadius: '5px',
                                marginBottom: '15px',
                                textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Pickup Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={pickupTime || getDefaultTime()}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="form-control"
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <small style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
                                    Parent will receive reminder 30 minutes before pickup
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Scheduling...' : '⏰ Schedule Reminder'}
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        flex: 1,
                                        background: '#6b7280',
                                        color: 'white'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PickupReminder;