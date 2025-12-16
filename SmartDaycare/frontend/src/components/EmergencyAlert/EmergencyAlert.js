import React, { useState } from 'react';
import axios from 'axios';

const EmergencyAlert = ({ staffId, childId }) => {
    const [showForm, setShowForm] = useState(false);
    const [emergencyType, setEmergencyType] = useState('illness');
    const [details, setDetails] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`http://localhost:5560/api/activities/${childId}/emergency`, {
                staffId,
                emergencyType,
                details,
                symptoms,
                severity
            });

            if (response.data.success) {
                setMessage('✅ Emergency alert sent to parent successfully!');
                setEmergencyType('illness');
                setDetails('');
                setSymptoms('');
                setSeverity('medium');
                setTimeout(() => setShowForm(false), 2000);
            }
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            setMessage('❌ Failed to send emergency alert. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="emergency-alert-container">
            <button
                className="emergency-btn"
                onClick={() => setShowForm(!showForm)}
                style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontFamily: "'Texturina', serif",
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                }}
            >
                🚨 Send Emergency Alert
            </button>

            {showForm && (
                <div className="emergency-form-overlay" style={{
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
                    <div className="emergency-form" style={{
                        background: '#dbbfbf',
                        padding: '30px',
                        borderRadius: '15px',
                        width: '500px',
                        maxWidth: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#dc2626', margin: 0 }}>🚨 Send Emergency Alert</h3>
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
                                <label>Emergency Type *</label>
                                <select
                                    value={emergencyType}
                                    onChange={(e) => setEmergencyType(e.target.value)}
                                    className="form-control"
                                    required
                                >
                                    <option value="illness">🤒 Illness/Health Issue</option>
                                    <option value="accident">🤕 Accident/Injury</option>
                                    <option value="allergy">🚫 Allergic Reaction</option>
                                    <option value="behavior">😠 Behavior Concern</option>
                                    <option value="other">⚠️ Other Emergency</option>
                                </select>
                            </div>

                            {emergencyType === 'illness' && (
                                <>
                                    <div className="form-group">
                                        <label>Symptoms *</label>
                                        <input
                                            type="text"
                                            value={symptoms}
                                            onChange={(e) => setSymptoms(e.target.value)}
                                            className="form-control"
                                            placeholder="e.g., Fever, Cough, Vomiting"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Severity *</label>
                                        <select
                                            value={severity}
                                            onChange={(e) => setSeverity(e.target.value)}
                                            className="form-control"
                                            required
                                        >
                                            <option value="low">Low - Monitor</option>
                                            <option value="medium">Medium - Concerning</option>
                                            <option value="high">High - Needs Attention</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Details *</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="form-control textarea"
                                    placeholder="Describe the emergency in detail..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Sending...' : '🚨 Send Alert to Parent'}
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

export default EmergencyAlert;