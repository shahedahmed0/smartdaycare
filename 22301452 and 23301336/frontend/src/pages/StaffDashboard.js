// import React, { useEffect, useState } from "react";
// import {
//   UserGroupIcon,
//   ClockIcon,
//   ClipboardDocumentListIcon,
// } from "@heroicons/react/24/outline";
// import ActivityForm from "../components/ActivityForm";
// import axios from "axios";

// const StaffDashboard = () => {
//   const [assignedChildren, setAssignedChildren] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [loadingChildren, setLoadingChildren] = useState(true);
//   const [loadingActivities, setLoadingActivities] = useState(true);
//   const [error, setError] = useState(null);

//   const token = localStorage.getItem("token");

//   // TODO: Fetch assigned children when endpoint ready
//   const fetchAssignedChildren = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/children/assigned", // <-- Replace when your backend endpoint is created
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setAssignedChildren(res.data.data || []);
//     } catch (err) {
//       setAssignedChildren([]);
//       console.log("Assigned children fetch skipped — endpoint pending.");
//     } finally {
//       setLoadingChildren(false);
//     }
//   };

//   // TODO: Fetch staff activities when endpoint ready
//   const fetchStaffActivities = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/activities/staff", // <-- Replace later
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setRecentActivities(res.data.data || []);
//     } catch (err) {
//       setRecentActivities([]);
//       console.log("Staff activities fetch skipped — endpoint pending.");
//     } finally {
//       setLoadingActivities(false);
//     }
//   };

//   useEffect(() => {
//     fetchAssignedChildren();
//     fetchStaffActivities();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* NAVBAR */}
//       <div className="bg-white shadow fixed w-full top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-blue-600">Staff Dashboard</h1>
//           <div className="text-sm text-gray-600">Daycare Activity Management</div>
//         </div>
//       </div>

//       <div className="pt-24 max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* LEFT COLUMN — Create Activity */}
//         <div className="lg:col-span-2">
//           <ActivityForm onCreated={fetchStaffActivities} />
//         </div>

//         {/* RIGHT COLUMN — Assigned Children + Recent Activities */}
//         <div className="space-y-8">

//           {/* ASSIGNED CHILDREN */}
//           <div className="bg-white p-6 rounded-xl shadow border">
//             <div className="flex items-center gap-2 mb-4">
//               <UserGroupIcon className="h-6 w-6 text-purple-600" />
//               <h2 className="text-lg font-semibold">My Assigned Children</h2>
//             </div>

//             {loadingChildren ? (
//               <div className="text-center py-6 text-gray-500">Loading...</div>
//             ) : assignedChildren.length === 0 ? (
//               <div className="p-6 text-gray-500 bg-gray-50 rounded-lg text-center">
//                 No assigned children yet.
//               </div>
//             ) : (
//               <ul className="space-y-3">
//                 {assignedChildren.map((child) => (
//                   <li
//                     key={child._id}
//                     className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
//                   >
//                     <div>
//                       <p className="font-medium">{child.name}</p>
//                       <p className="text-sm text-gray-500">
//                         Age: {child.age} | Parent: {child.parent?.name}
//                       </p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* RECENT ACTIVITIES */}
//           <div className="bg-white p-6 rounded-xl shadow border">
//             <div className="flex items-center gap-2 mb-4">
//               <ClockIcon className="h-6 w-6 text-green-600" />
//               <h2 className="text-lg font-semibold">Recent Activities</h2>
//             </div>

//             {loadingActivities ? (
//               <div className="text-center py-6 text-gray-500">Loading...</div>
//             ) : recentActivities.length === 0 ? (
//               <div className="p-6 text-gray-50 rounded-lg text-gray-500 text-center">
//                 No recent activity logs yet.
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {recentActivities.map((a) => (
//                   <div
//                     key={a._id}
//                     className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center"
//                   >
//                     <div>
//                       <p className="font-semibold text-gray-800">
//                         {a.title || a.activityType}
//                       </p>
//                       <p className="text-sm text-gray-600">{a.description}</p>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {new Date(a.date).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffDashboard;

import React, { useContext, useState } from "react";
import {
  AcademicCapIcon,
  HeartIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import API from "../utils/api"; // Your axios instance with token interceptor
import { AuthContext } from "../context/AuthContext";

const StaffDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [status, setStatus] = useState(null); // { type: "success" | "error", msg: string }

  // Get staff role (lowercase for matching)
  const staffRole = user?.staffRole?.toLowerCase();

  // Define activity options per role
  const activityOptions = {
    caregiver: [
      "Feeding",
      "Diaper Change",
      "Nap Supervision",
      "Playtime",
      "Comforting Child",
      "Bathroom Assistance",
      "Health Check",
      "Outdoor Play",
    ],
    teacher: [
      "Story Time",
      "Art & Craft Session",
      "Circle Time",
      "Learning Activity",
      "Music & Movement",
      "Group Game",
      "Reading Session",
      "Educational Play",
    ],
    cook: [
      "Breakfast Preparation",
      "Lunch Cooking",
      "Snack Preparation",
      "Dinner Preparation",
      "Kitchen Cleaning",
      "Food Serving",
      "Menu Planning",
      "Inventory Check",
    ],
  };

  const activities = activityOptions[staffRole] || [];

  // Handle starting an activity
  const startActivity = async (activityName) => {
    setStatus(null);

    let endpoint = "";
    let payloadKey = "";

    if (staffRole === "cook") {
      endpoint = "/staff-activities/cooking";
      payloadKey = "cookingtype";
    } else if (staffRole === "caregiver") {
      endpoint = "/staff-activities/caregiving";
      payloadKey = "caregivingtype";
    } else if (staffRole === "teacher") {
      endpoint = "/staff-activities/teaching";
      payloadKey = "teachingtype";
    } else {
      setStatus({ type: "error", msg: "Invalid staff role." });
      return;
    }

    try {
      await API.post(endpoint, {
        staffId: user._id,
        [payloadKey]: activityName,
      });

      setStatus({
        type: "success",
        msg: `"${activityName}" logged successfully! ✅`,
      });

      // Optional: auto-clear status after 4 seconds
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      console.error("Activity log failed:", err);
      setStatus({
        type: "error",
        msg:
          err.response?.data?.message ||
          "Failed to log activity. Please try again.",
      });
    }
  };

  // Icon mapping
  const getRoleIcon = () => {
    if (staffRole === "cook") return <AcademicCapIcon className="h-8 w-8" />;
    if (staffRole === "caregiver") return <HeartIcon className="h-8 w-8" />;
    if (staffRole === "teacher") return <BookOpenIcon className="h-8 w-8" />;
    return <ClipboardDocumentListIcon className="h-8 w-8" />;
  };

  const getRoleColor = () => {
    if (staffRole === "cook") return "text-amber-600";
    if (staffRole === "caregiver") return "text-pink-600";
    if (staffRole === "teacher") return "text-indigo-600";
    return "text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Logout
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 ${getRoleColor()}`}
            >
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Staff Activity Dashboard
              </h1>
              <p className="text-sm text-slate-600">
                Welcome back, <strong>{user?.name}</strong> • {user?.staffRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Status Message */}
        {status && (
          <div
            className={`mb-8 p-5 rounded-2xl border text-center text-lg font-medium shadow-sm ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {status.msg}
          </div>
        )}

        {/* Main Activity Grid */}
        <div className="bg-white rounded-3xl shadow-lg border p-10">
          <div className="text-center mb-10">
            <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900">
              Log Your Current Activity
            </h2>
            <p className="text-slate-600 mt-3 text-lg">
              Click any button below to record what you're doing right now
            </p>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-500">
                No activities defined for your role yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <button
                  key={activity}
                  onClick={() => startActivity(activity)}
                  className="group relative p-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 
                           hover:from-indigo-100 hover:via-blue-100 hover:to-purple-100 
                           border-2 border-indigo-200 rounded-2xl shadow-md hover:shadow-xl 
                           transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-white/40 rounded-2xl opacity-0 group-hover:opacity-100 transition" />
                  <div className="relative z-10 text-center">
                    <ClockIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-800">
                      {activity}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-slate-500">
          <p className="text-sm">
            All activities are automatically timestamped and logged for daycare
            records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
