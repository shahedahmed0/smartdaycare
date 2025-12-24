import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StaffPage from './pages/StaffPage';
import ParentPage from './pages/ParentPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';

function App() {
  const [currentPage, setCurrentPage] = useState('staff');
  const [staffId] = useState('Jim Lindsay');
  const [childId] = useState('Liam Ahmed');

  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <h1 className="gwendolyn-bold">🏡 SmartDaycare</h1>
          <p className="warning">
            Module 3: Daily Activity Management & Parent Notifications
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
            <Link to="/notifications">
              <button
                className={`nav-btn ${currentPage === 'notifications' ? 'active' : ''}`}
                onClick={() => setCurrentPage('notifications')}
              >
                🔔 Notifications
              </button>
            </Link>
            <Link to="/chat">
              <button
                className={`nav-btn ${currentPage === 'chat' ? 'active' : ''}`}
                onClick={() => setCurrentPage('chat')}
              >
                💬 Chat
              </button>
            </Link>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<StaffPage staffId={staffId} childId={childId} />} />
            <Route path="/staff" element={<StaffPage staffId={staffId} childId={childId} />} />
            <Route path="/parent" element={<ParentPage childId={childId} />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>

        <footer>
          <p>CSE471 - System Analysis and Design | Module 3: Daily Activity Management & Parent Notifications</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: '0.8' }}>
            Powered by Texturina Typography | Database: 22299315
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '5px', opacity: '0.6' }}>
            Chat Feature: Module 3, Feature 3 - Parent-Staff Communication
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;