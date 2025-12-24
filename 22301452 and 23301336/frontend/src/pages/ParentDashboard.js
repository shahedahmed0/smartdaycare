import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import AddChild from "../components/AddChild";
import ChildCard from "../components/ChildCard";
import ChildDetail from "../components/ChildDetail";

const ParentDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  // fetch children on load
  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildren(res.data.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleChildAdded = (newChild) => {
    setChildren((prev) => [...prev, newChild]);
    setShowAddChild(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAV BAR */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Smart Daycare</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">Signed in as {user?.name}</div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h2>
          <p className="text-gray-600 text-sm">Role: Parent</p>
        </div>

        {/* CHILDREN SECTION */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Children ({children.length})</h2>

            <button
              onClick={() => setShowAddChild(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
            >
              Register New Child
            </button>
          </div>

          {children.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow">
              No children registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildCard
                  key={child._id}
                  child={child}
                  onView={() => setSelectedChild(child)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showAddChild && (
        <AddChild
          onClose={() => setShowAddChild(false)}
          onChildAdded={handleChildAdded}
        />
      )}

      {selectedChild && (
        <ChildDetail
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
          onUpdate={(updated) =>
            setChildren((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            )
          }
        />
      )}
    </div>
  );
};

export default ParentDashboard;
