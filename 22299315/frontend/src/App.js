import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StaffPage from './pages/StaffPage';
import ParentPage from './pages/ParentPage';
import AdminPortal from './components/AdminPortal/AdminPortal';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('staff');
  const [staffId] = useState('STAFF001');
  const [childId] = useState('CHILD001');

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <h1 className="gwendolyn-bold">🏡 SmartDaycare</h1>
          <p className="warning">
            Disclaimer: The project is still work on progress. Which is why parent and staff pages are shown on the same site. Once the project is finished, it will be connected with their respective portals.
          </p>

          <div className="nav">
            <Link to="/staff">
              <button
                className={`nav-btn ${currentPage === 'staff' ? 'active' : ''}`}
                onClick={() => setCurrentPage('staff')}
              >
                👩‍🏫 Staff Portal
              </button>
            </Link>
            <Link to="/parent">
              <button
                className={`nav-btn ${currentPage === 'parent' ? 'active' : ''}`}
                onClick={() => setCurrentPage('parent')}
              >
                👨‍👩‍👧 Parent Portal
              </button>
            </Link>
            <Link to="/admin">
              <button
                className={`nav-btn-0 ${currentPage === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentPage('admin')}
              >
                🛠 Admin Portal
              </button>
            </Link>
            <Link to="/notifications">
              <button
                className={`nav-btn ${currentPage === 'notifications' ? 'active' : ''}`}
                onClick={() => setCurrentPage('notifications')}
              >
                🔔 Notifications
              </button>
            </Link>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<StaffPage staffId={staffId} childId={childId} />} />
            <Route path="/staff" element={<StaffPage staffId={staffId} childId={childId} />} />
            <Route path="/parent" element={<ParentPage childId={childId} />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>

        <footer>
          <p>CSE471 - System Analysis and Design | Feature 1: Daily Activity Management</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: '0.8' }}>
            Powered by Texturina Typography
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;