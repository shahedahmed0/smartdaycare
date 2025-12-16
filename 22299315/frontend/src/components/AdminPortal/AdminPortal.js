// src/components/AdminPortal/AdminPortal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPortal() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        serial: '',
        name: '',
        email: '',
        password: 'default123',
        phone: '',
        role: '',
        experience: '',
        joiningDate: new Date().toISOString().split('T')[0]
    });

    const fetchStaff = async () => {
        try {
            const res = await axios.get('http://localhost:5560/api/staff');
            if (res.data.success) {
                setStaffList(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError('Failed to load staff list. Please check if backend is running.');
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:5560/api/staff', form);
            if (response.data.success) {
                setSuccess('✅ Staff member added successfully!');
                setForm({
                    serial: '',
                    name: '',
                    email: '',
                    password: 'default123',
                    phone: '',
                    role: '',
                    experience: '',
                    joiningDate: new Date().toISOString().split('T')[0]
                });
                fetchStaff();
            }
        } catch (err) {
            console.error('Error adding staff:', err);
            setError(err.response?.data?.message || 'Failed to add staff member');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const response = await axios.delete(`http://localhost:5560/api/staff/${id}`);
            if (response.data.success) {
                setSuccess('🗑️ Staff member deleted successfully!');
                fetchStaff();
            }
        } catch (err) {
            console.error('Error deleting staff:', err);
            setError('Failed to delete staff member');
        }
    };

    return (
        <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            fontFamily: "'Texturina', serif",
            background: 'linear-gradient(135deg, #f5cfcf 0%, #dbbfbf 100%)',
            minHeight: '100vh'
        }}>
        <div style={{ textAlign: 'center' }}>
        <h1 style={{
            color: '#d81b60',
            fontWeight: 'bold',
            fontSize: '2.5rem',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
        👩‍💼 Admin Portal
        </h1>
        <p style={{ color: '#4a5568', marginBottom: '5px' }}>
        <strong>Module 2, Feature 1:</strong> Staff Registration & Management
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        Manage daycare staff members - caregivers, teachers, cooks, and admins
        </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
            <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #fca5a5',
                textAlign: 'center'
            }}>
            {error}
            </div>
        )}

        {success && (
            <div style={{
                background: '#d1fae5',
                color: '#065f46',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                textAlign: 'center'
            }}>
            {success}
            </div>
        )}

        {/* Add Staff Form */}
        <div style={{
            background: '#dbbfbf',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        <h3 style={{
            color: '#2d3748',
            marginBottom: '20px',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
        <span>➕</span> Add New Staff Member
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
        name="serial"
        placeholder="Staff ID *"
        value={form.serial}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        />
        <input
        name="name"
        placeholder="Full Name *"
        value={form.name}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
        name="email"
        type="email"
        placeholder="Email Address *"
        value={form.email}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        />
        <input
        name="phone"
        placeholder="Phone Number *"
        value={form.phone}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <select
        name="role"
        value={form.role}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        >
        <option value="">Select Role *</option>
        <option value="caregiver">👩‍🍼 Caregiver</option>
        <option value="teacher">👩‍🏫 Teacher</option>
        <option value="cook">👨‍🍳 Cook</option>
        <option value="admin">🛠 Admin</option>
        </select>

        <input
        name="experience"
        type="number"
        placeholder="Experience (years)"
        value={form.experience}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        min="0"
        max="50"
        />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
        name="joiningDate"
        type="date"
        value={form.joiningDate}
        onChange={handleChange}
        style={{
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            background: 'rgba(255, 255, 255, 0.9)',
            flex: '1',
            minWidth: '200px'
        }}
        required
        />
        <div style={{
            flex: '1',
            minWidth: '200px',
            padding: '12px 15px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6b7280'
        }}>
        <strong>Default Password:</strong> default123
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
        (Can be changed later by the staff member)
        </div>
        </div>
        </div>

        <button
        type="submit"
        style={{
            padding: '14px 28px',
            background: 'linear-gradient(45deg, #e91e63, #f06292)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: "'Texturina', serif",
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
            alignSelf: 'flex-start',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
        }}
        disabled={loading}
        >
        {loading ? 'Adding...' : '➕ Add Staff Member'}
        </button>
        </form>
        </div>

        {/* Staff List */}
        <div style={{
            background: '#dbbfbf',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        <h3 style={{
            color: '#2d3748',
            marginBottom: '20px',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
        <span>📋</span> Staff List ({staffList.length} members)
        </h3>

        {staffList.length === 0 ? (
            <p style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280',
                fontStyle: 'italic'
            }}>
            No staff members added yet. Add your first staff member above!
            </p>
        ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(255, 255, 255, 0.9)',
             borderRadius: '10px',
             overflow: 'hidden',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
            <thead>
            <tr style={{ background: 'linear-gradient(45deg, #e91e63, #f06292)' }}>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Staff ID</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Email</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Phone</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Role</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Experience</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Joining Date</th>
            <th style={{ padding: '15px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {staffList.map(staff => (
                <tr key={staff._id} style={{
                    transition: 'background 0.2s',
                    ':hover': { background: 'rgba(255, 224, 240, 0.3)' }
                }}>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>
                <strong>{staff.serial}</strong>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>{staff.name}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>{staff.email}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>{staff.phone}</td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>
                <span style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: staff.role === 'caregiver' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                    staff.role === 'teacher' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' :
                    staff.role === 'cook' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                     color: 'white'
                }}>
                {staff.role}
                </span>
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>
                {staff.experience} {staff.experience === 1 ? 'year' : 'years'}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>
                {new Date(staff.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}
                </td>
                <td style={{ padding: '15px', borderBottom: '1px solid #f06292' }}>
                <button
                onClick={() => handleDelete(staff._id)}
                style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                     color: 'white',
                                     border: 'none',
                                     borderRadius: '6px',
                                     cursor: 'pointer',
                                     fontWeight: '500',
                                     fontFamily: "'Texturina', serif",
                                     transition: 'all 0.3s ease',
                                     ':hover': {
                                         transform: 'translateY(-1px)',
                                     boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                     }
                }}
                >
                Delete
                </button>
                </td>
                </tr>
            ))}
            </tbody>
            </table>
            </div>
        )}
        </div>
        </div>
    );
}
