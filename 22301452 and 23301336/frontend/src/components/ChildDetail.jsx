import React, { useState } from 'react';
import axios from 'axios';

const ChildDetail = ({ child, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(child);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    address: ''
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'allergies') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/children/${child._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Profile updated successfully!');
      onUpdate(response.data.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmergencyContact = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/children/${child._id}/emergency-contacts`,
        newContact,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Emergency contact added successfully!');
      onUpdate(response.data.data);
      setShowAddContact(false);
      setNewContact({ name: '', relationship: '', phone: '', address: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/children/${child._id}/emergency-contacts/${contactId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Emergency contact deleted successfully!');
      onUpdate(response.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Child Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={Array.isArray(formData.allergies) ? formData.allergies.join(', ') : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                  <textarea
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-900">{child.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Age:</span>
                    <p className="text-gray-900">{child.age} years old</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date of Birth:</span>
                    <p className="text-gray-900">{formatDate(child.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Gender:</span>
                    <p className="text-gray-900 capitalize">{child.gender}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Allergies:</span>
                    <p className="text-gray-900">
                      {child.allergies && child.allergies.length > 0 
                        ? child.allergies.join(', ') 
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <p className="text-gray-900 capitalize">{child.status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-700">Medical Notes:</span>
                    <p className="text-gray-900">{child.medicalNotes || 'None'}</p>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(child);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Guardian Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Guardian Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Primary Guardian</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="text-gray-900">{child.guardianInfo?.primaryGuardian?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Relationship:</span>
                    <p className="text-gray-900">{child.guardianInfo?.primaryGuardian?.relationship || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="text-gray-900">{child.guardianInfo?.primaryGuardian?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="text-gray-900">{child.guardianInfo?.primaryGuardian?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {child.guardianInfo?.secondaryGuardian?.name && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Secondary Guardian</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="text-gray-900">{child.guardianInfo?.secondaryGuardian?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Relationship:</span>
                      <p className="text-gray-900">{child.guardianInfo?.secondaryGuardian?.relationship}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="text-gray-900">{child.guardianInfo?.secondaryGuardian?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="text-gray-900">{child.guardianInfo?.secondaryGuardian?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Emergency Contacts</h3>
              <button
                onClick={() => setShowAddContact(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Add Contact
              </button>
            </div>

            {showAddContact && (
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="font-semibold mb-3">Add Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newContact.address}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmergencyContact}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {child.emergencyContacts && child.emergencyContacts.length > 0 ? (
                child.emergencyContacts.map((contact) => (
                  <div key={contact._id} className="bg-gray-50 p-4 rounded-md flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="text-gray-900">{contact.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Relationship:</span>
                        <p className="text-gray-900">{contact.relationship}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="text-gray-900">{contact.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="text-gray-900">{contact.address || 'N/A'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No emergency contacts added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetail;