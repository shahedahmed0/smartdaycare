// src/components/ActivityForm.js
import React, { useState } from 'react';
import axios from 'axios';

const ActivityForm = ({ staffId, childId, onActivityCreated }) => {
    const [formData, setFormData] = useState({
        type: 'update',
        title: '',
        description: '',
        mealType: '',
        napDuration: 30,
        activityType: '',
        mood: '',
        foodItems: '',
        quantity: ''
    });

    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 5) {
            alert('Maximum 5 photos allowed');
            return;
        }
        setPhotos(prev => [...prev, ...files]);
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('staffId', staffId);
            formDataToSend.append('childId', childId);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);

            // Add conditional details based on activity type
            if (formData.type === 'meal') {
                formDataToSend.append('mealType', formData.mealType);
                formDataToSend.append('foodItems', formData.foodItems);
                formDataToSend.append('quantity', formData.quantity);
            } else if (formData.type === 'nap') {
                formDataToSend.append('napDuration', formData.napDuration);
                formDataToSend.append('mood', formData.mood);
            } else if (formData.type === 'activity') {
                formDataToSend.append('activityType', formData.activityType);
            }

            // Add photos
            photos.forEach(photo => {
                formDataToSend.append('photos', photo);
            });

            const response = await axios.post('http://localhost:5560/api/activities', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess('Activity created successfully!');

                // Reset form
                setFormData({
                    type: 'update',
                    title: '',
                    description: '',
                    mealType: '',
                    napDuration: 30,
                    activityType: '',
                    mood: '',
                    foodItems: '',
                    quantity: ''
                });
                setPhotos([]);

                // Notify parent component
                if (onActivityCreated) {
                    onActivityCreated();
                }
            }
        } catch (err) {
            console.error('Error creating activity:', err);
            setError(err.response?.data?.message || 'Failed to create activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="activity-form">
        {error && (
            <div className="error-message" style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #fca5a5'
            }}>
            {error}
            </div>
        )}

        {success && (
            <div className="success-message" style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #a7f3d0'
            }}>
            {success}
            </div>
        )}

        <div className="form-group">
        <label>Activity Type *</label>
        <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="form-control"
        required
        >
        <option value="update">📝 General Update</option>
        <option value="meal">🍽️ Meal</option>
        <option value="nap">😴 Nap</option>
        <option value="activity">🎨 Activity</option>
        </select>
        </div>

        <div className="form-group">
        <label>Title *</label>
        <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="form-control"
        placeholder="e.g., Lunch Time, Afternoon Nap, Painting Activity"
        required
        />
        </div>

        <div className="form-group">
        <label>Description *</label>
        <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="form-control textarea"
        placeholder="Describe the activity in detail..."
        rows="4"
        required
        />
        </div>

        {/* Meal-specific fields */}
        {formData.type === 'meal' && (
            <div className="activity-details-section">
            <h4>🍽️ Meal Details</h4>
            <div className="form-group">
            <label>Meal Type</label>
            <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            className="form-control"
            >
            <option value="">Select meal type</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snack">Snack</option>
            <option value="dinner">Dinner</option>
            </select>
            </div>

            <div className="form-group">
            <label>Food Items (comma separated)</label>
            <input
            type="text"
            name="foodItems"
            value={formData.foodItems}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., Rice, Chicken, Vegetables, Fruits"
            />
            </div>

            <div className="form-group">
            <label>Quantity Eaten</label>
            <select
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-control"
            >
            <option value="">Select quantity</option>
            <option value="all">All</option>
            <option value="most">Most</option>
            <option value="half">Half</option>
            <option value="little">Little</option>
            <option value="none">None</option>
            </select>
            </div>
            </div>
        )}

        {/* Nap-specific fields */}
        {formData.type === 'nap' && (
            <div className="activity-details-section">
            <h4>😴 Nap Details</h4>
            <div className="form-group">
            <label>Nap Duration (minutes)</label>
            <input
            type="number"
            name="napDuration"
            value={formData.napDuration}
            onChange={handleChange}
            className="form-control"
            min="1"
            max="300"
            step="5"
            />
            </div>

            <div className="form-group">
            <label>Child's Mood</label>
            <select
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            className="form-control"
            >
            <option value="">Select mood</option>
            <option value="happy">Happy 😊</option>
            <option value="sleepy">Sleepy 😴</option>
            <option value="cranky">Cranky 😠</option>
            <option value="peaceful">Peaceful 😌</option>
            <option value="active">Active 🏃</option>
            </select>
            </div>
            </div>
        )}

        {/* Activity-specific fields */}
        {formData.type === 'activity' && (
            <div className="activity-details-section">
            <h4>🎨 Activity Details</h4>
            <div className="form-group">
            <label>Activity Type</label>
            <select
            name="activityType"
            value={formData.activityType}
            onChange={handleChange}
            className="form-control"
            >
            <option value="">Select activity type</option>
            <option value="indoor">Indoor Play</option>
            <option value="outdoor">Outdoor Play</option>
            <option value="learning">Learning Activity</option>
            <option value="creative">Creative Activity</option>
            <option value="physical">Physical Activity</option>
            </select>
            </div>
            </div>
        )}

        {/* Photo Upload */}
        <div className="form-group">
        <label>Upload Photos (Max 5)</label>
        <div className="photo-upload-container">
        <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoChange}
        disabled={photos.length >= 5}
        style={{ display: 'none' }}
        id="photo-upload"
        />
        <label htmlFor="photo-upload" className="btn btn-primary" style={{
            cursor: 'pointer',
            display: 'inline-block',
            marginBottom: '10px'
        }}>
        📷 Choose Photos
        </label>
        <p style={{ color: '#4a5568', fontSize: '0.9rem' }}>
        {photos.length}/5 photos selected • Max 5MB per photo
        </p>

        {photos.length > 0 && (
            <div className="photo-preview" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginTop: '15px'
            }}>
            {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative' }}>
                <img
                src={URL.createObjectURL(photo)}
                alt={`Preview ${index + 1}`}
                style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                />
                <button
                type="button"
                onClick={() => removePhoto(index)}
                style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}
                >
                ×
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
        </div>

        <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{
            marginTop: '20px',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
        }}
        >
        {loading ? (
            <>
            <span style={{ marginRight: '8px' }}>⏳</span>
            Creating Activity...
            </>
        ) : (
            '✅ Create Activity Log'
        )}
        </button>
        </form>
    );
};

export default ActivityForm;
