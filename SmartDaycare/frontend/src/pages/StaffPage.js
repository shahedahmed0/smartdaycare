import React, { useState } from 'react';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';
import EmergencyAlert from '../components/EmergencyAlert/EmergencyAlert';
import PickupReminder from '../components/PickupReminder/PickupReminder';

const StaffPage = ({ staffId, childId }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleActivityCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            <div className="form-container">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '20px', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                }}>
                    <div>
                        <h2>📝 Create Activity Log</h2>
                        <p className="mb-4">Staff: {staffId} | Child: {childId}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <PickupReminder childId={childId} />
                        <EmergencyAlert staffId={staffId} childId={childId} />
                    </div>
                </div>
                <ActivityForm
                    staffId={staffId}
                    childId={childId}
                    onActivityCreated={handleActivityCreated}
                />
            </div>

            <div className="activities-container">
                <h2>📋 Activity History</h2>
                <p>Your recent posts and updates</p>
                <ActivityList
                    key={refreshKey}
                    type="staff"
                    staffId={staffId}
                />
            </div>
        </div>
    );
};

export default StaffPage;