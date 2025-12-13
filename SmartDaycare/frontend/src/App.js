import React, { useState } from 'react';
import StaffPage from './pages/StaffPage';
import ParentPage from './pages/ParentPage';
import AdminPortal from './components/AdminPortal/AdminPortal'; // new import

function App() {
  const [currentPage, setCurrentPage] = useState('staff');
  const [staffId] = useState('STAFF001');
  const [childId] = useState('CHILD001');

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="gwendolyn-bold">🏡 SmartDaycare</h1>
        <p className="warning">
          Disclaimer: The project is still work on progress. Which is why parent and staff pages are shown on the same site. Once the project is finished, it will be connected with their respective portals.
        </p>

        <div className="nav">
          <button
            className={`nav-btn ${currentPage === 'staff' ? 'active' : ''}`}
            onClick={() => setCurrentPage('staff')}
          >
            👩‍🏫 Staff Portal
          </button>
          <button
            className={`nav-btn ${currentPage === 'parent' ? 'active' : ''}`}
            onClick={() => setCurrentPage('parent')}
          >
            👨‍👩‍👧 Parent Portal
          </button>
          <button
            className={`nav-btn-0 ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentPage('admin')}
          >
            🛠 Admin Portal
          </button>
        </div>
      </header>

      <main>
        {currentPage === 'staff' && <StaffPage staffId={staffId} childId={childId} />}
        {currentPage === 'parent' && <ParentPage childId={childId} />}
        {currentPage === 'admin' && <AdminPortal />}
      </main>

      <footer>
        <p>CSE471 - System Analysis and Design | Feature 1: Daily Activity Management</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: '0.8' }}>
          Powered by Texturina Typography
        </p>
      </footer>
    </div>
  );
}

export default App;
