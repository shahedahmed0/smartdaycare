// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ArrowPathIcon,
//   MagnifyingGlassIcon,
//   UserPlusIcon,
//   TrashIcon,
// } from "@heroicons/react/24/outline";

// import API from "../utils/api";
// import { AuthContext } from "../context/AuthContext";

// const STAFF_ROLES = [
//   { value: "caregiver", label: "Caregiver" },
//   { value: "teacher", label: "Teacher" },
//   { value: "cook", label: "Cook" },
// ];

// const roleBadge = (staffRole) => {
//   const v = String(staffRole || "").toLowerCase();
//   if (v === "teacher") return "bg-indigo-50 text-indigo-700 border-indigo-200";
//   if (v === "cook") return "bg-amber-50 text-amber-700 border-amber-200";
//   return "bg-emerald-50 text-emerald-700 border-emerald-200"; // caregiver default
// };

// const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

// export default function AdminDashboard() {
//   const { user, logout } = React.useContext(AuthContext);

//   const [staffList, setStaffList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [status, setStatus] = useState(null); // {type, msg}

//   const [query, setQuery] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     staffRole: "",
//     experience: "",
//     joiningDate: "",
//   });

//   const fetchStaff = async () => {
//     setLoading(true);
//     setStatus(null);
//     try {
//       const res = await API.get("/users/staff");
//       setStaffList(res.data?.data || []);
//       console.log(res.data);
//     } catch (e) {
//       console.error(e);
//       setStatus({ type: "error", msg: "Failed to load staff list." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const stats = useMemo(() => {
//     const total = staffList.length;
//     const caregiver = staffList.filter(
//       (s) => s.staffRole === "caregiver"
//     ).length;
//     const teacher = staffList.filter((s) => s.staffRole === "teacher").length;
//     const cook = staffList.filter((s) => s.staffRole === "cook").length;
//     return { total, caregiver, teacher, cook };
//   }, [staffList]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return staffList
//       .filter((s) => {
//         if (roleFilter !== "all" && s.staffRole !== roleFilter) return false;
//         if (!q) return true;
//         const hay = `${s.name || ""} ${s.email || ""} ${
//           s.phone || ""
//         }`.toLowerCase();
//         return hay.includes(q);
//       })
//       .slice()
//       .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//   }, [staffList, query, roleFilter]);

//   const handleCreateStaff = async (e) => {
//     e.preventDefault();
//     setStatus(null);
//     setCreating(true);

//     try {
//       const payload = {
//         name: form.name.trim(),
//         email: form.email.trim(),
//         phone: form.phone.trim(),
//         staffRole: form.staffRole,
//         experience:
//           form.experience === "" ? undefined : Number(form.experience),
//         joiningDate: form.joiningDate || undefined,
//       };
//       console.log(payload);

//       const res = await API.post("/users/staff", payload);
//       const created = res.data?.data;
//       const tempPassword = res.data?.tempPassword;

//       setStaffList((prev) => [created, ...prev].filter(Boolean));
//       setForm({
//         name: "",
//         email: "",
//         phone: "",
//         staffRole: "caregiver",
//         experience: "",
//         joiningDate: "",
//       });

//       setStatus({
//         type: "success",
//         msg: tempPassword
//           ? `Staff created. Temporary password: ${tempPassword} (share this with staff to log in).`
//           : "Staff created successfully.",
//       });
//     } catch (err) {
//       console.error(err);
//       setStatus({
//         type: "error",
//         msg: err.response?.data?.error || "Failed to create staff.",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };

//   const deleteStaff = async (id) => {
//     if (!window.confirm("Remove this staff member?")) return;
//     try {
//       await API.delete(`/users/${id}`);
//       setStaffList((prev) => prev.filter((s) => s._id !== id));
//     } catch (err) {
//       console.error(err);
//       setStatus({ type: "error", msg: "Failed to delete staff." });
//     }
//   };

//   // Handle Admin Request for User
//   const handleAdminRequest = async (id) => {
//     try {
//       const res = await API.post(`/users/request-admin/${id}`);
//       alert(res.data?.message || "Admin request submitted successfully.");
//     } catch (err) {
//       alert("Failed to submit admin request.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//       {/* Top bar */}
//       <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
//             <p className="text-sm text-slate-600">
//               Staff management • roles • onboarding
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="hidden sm:block text-right">
//               <div className="text-sm font-semibold text-slate-900">
//                 {user?.name || "Admin"}
//               </div>
//               <div className="text-xs text-slate-500">{user?.email}</div>
//             </div>
//             <button
//               onClick={logout}
//               className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Status */}
//         {status?.type && (
//           <div
//             className={`mb-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
//               status.type === "success"
//                 ? "bg-emerald-50 text-emerald-800 border-emerald-200"
//                 : "bg-rose-50 text-rose-800 border-rose-200"
//             }`}
//           >
//             {status.msg}
//           </div>
//         )}

//         {/* Stats */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="rounded-2xl border bg-white p-5 shadow-sm">
//             <div className="text-xs text-slate-500">Total Staff</div>
//             <div className="mt-2 text-3xl font-bold text-slate-900">
//               {stats.total}
//             </div>
//           </div>
//           <div className="rounded-2xl border bg-white p-5 shadow-sm">
//             <div className="text-xs text-slate-500">Caregivers</div>
//             <div className="mt-2 text-3xl font-bold text-slate-900">
//               {stats.caregiver}
//             </div>
//           </div>
//           <div className="rounded-2xl border bg-white p-5 shadow-sm">
//             <div className="text-xs text-slate-500">Teachers</div>
//             <div className="mt-2 text-3xl font-bold text-slate-900">
//               {stats.teacher}
//             </div>
//           </div>
//           <div className="rounded-2xl border bg-white p-5 shadow-sm">
//             <div className="text-xs text-slate-500">Cooks</div>
//             <div className="mt-2 text-3xl font-bold text-slate-900">
//               {stats.cook}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Create staff */}
//           <div className="lg:col-span-1">
//             <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b flex items-center gap-3">
//                 <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
//                   <UserPlusIcon className="h-5 w-5 text-indigo-700" />
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-slate-900">Add Staff</h2>
//                   <p className="text-xs text-slate-500">
//                     Create a staff account with a sub-role
//                   </p>
//                 </div>
//               </div>

//               <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1">
//                     Full Name
//                   </label>
//                   <input
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     required
//                     className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                     placeholder="e.g., Ayesha Rahman"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={form.email}
//                     onChange={(e) =>
//                       setForm({ ...form, email: e.target.value })
//                     }
//                     required
//                     className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                     placeholder="e.g., staff@daycare.com"
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       Phone
//                     </label>
//                     <input
//                       value={form.phone}
//                       onChange={(e) =>
//                         setForm({ ...form, phone: e.target.value })
//                       }
//                       className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                       placeholder="017XXXXXXXX"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       Staff Role
//                     </label>
//                     <select
//                       value={form.staffRole}
//                       onChange={(e) =>
//                         setForm({ ...form, staffRole: e.target.value })
//                       }
//                       className="w-full rounded-xl border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                     >
//                       {STAFF_ROLES.map((r) => (
//                         <option key={r.value} value={r.value}>
//                           {r.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       Experience (years)
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       value={form.experience}
//                       onChange={(e) =>
//                         setForm({ ...form, experience: e.target.value })
//                       }
//                       className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                       placeholder="e.g., 3"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-semibold text-slate-700 mb-1">
//                       Joining Date
//                     </label>
//                     <input
//                       type="date"
//                       value={form.joiningDate}
//                       onChange={(e) =>
//                         setForm({ ...form, joiningDate: e.target.value })
//                       }
//                       className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                     />
//                   </div>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={creating}
//                   className="w-full rounded-xl bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
//                 >
//                   {creating ? "Creating..." : "Create Staff"}
//                 </button>

//                 <p className="text-xs text-slate-500">
//                   Tip: a temporary password is generated automatically. Share it
//                   with the staff member so they can log in.
//                 </p>
//               </form>
//             </div>
//           </div>

//           {/* Staff table */}
//           <div className="lg:col-span-2">
//             <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
//                 <div>
//                   <h2 className="font-semibold text-slate-900">
//                     Staff Directory
//                   </h2>
//                   <p className="text-xs text-slate-500">
//                     Search, filter, and manage staff accounts
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <div className="relative">
//                     <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                     <input
//                       value={query}
//                       onChange={(e) => setQuery(e.target.value)}
//                       placeholder="Search name, email, phone"
//                       className="pl-10 pr-3 py-2.5 rounded-xl border w-72 max-w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                     />
//                   </div>

//                   <select
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                     className="py-2.5 rounded-xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//                   >
//                     <option value="all">All roles</option>
//                     {STAFF_ROLES.map((r) => (
//                       <option key={r.value} value={r.value}>
//                         {r.label}
//                       </option>
//                     ))}
//                   </select>

//                   <button
//                     onClick={fetchStaff}
//                     className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition"
//                     title="Refresh"
//                   >
//                     <ArrowPathIcon className="h-5 w-5" />
//                     <span className="hidden sm:inline">Refresh</span>
//                   </button>
//                 </div>
//               </div>

//               {loading ? (
//                 <div className="py-10 text-center text-slate-500">
//                   Loading staff…
//                 </div>
//               ) : filtered.length === 0 ? (
//                 <div className="py-10 text-center text-slate-500">
//                   No staff found. Try changing your search/filter.
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="text-left bg-slate-50 border-b">
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Staff
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Role
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Contact
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Experience
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Joining
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Added
//                         </th>
//                         <th className="py-3.5 px-4 font-semibold text-slate-700">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {filtered.map((s) => (
//                         <tr
//                           key={s._id}
//                           className="border-b last:border-b-0 hover:bg-slate-50/60"
//                         >
//                           <td className="py-3.5 px-4">
//                             <div className="font-semibold text-slate-900">
//                               {s.name}
//                             </div>
//                             <div className="text-xs text-slate-500">
//                               {s.email}
//                             </div>
//                           </td>
//                           <td className="py-3.5 px-4">
//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${roleBadge(
//                                 s.staffRole
//                               )}`}
//                             >
//                               {String(s.staffRole).toUpperCase()}
//                             </span>
//                           </td>
//                           <td className="py-3.5 px-4 text-slate-700">
//                             {s.phone || "-"}
//                           </td>
//                           <td className="py-3.5 px-4 text-slate-700">
//                             {s.experience === 0 || s.experience
//                               ? `${s.experience} yrs`
//                               : "-"}
//                           </td>
//                           <td className="py-3.5 px-4 text-slate-700">
//                             {fmtDate(s.joiningDate)}
//                           </td>
//                           <td className="py-3.5 px-4 text-slate-700">
//                             {fmtDate(s.createdAt)}
//                           </td>
//                           <td className="py-3.5 px-4">
//                             {s.role === "parent" && (
//                               <button
//                                 onClick={() => handleAdminRequest(s._id)}
//                                 className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
//                               >
//                                 Request Admin
//                               </button>
//                             )}
//                             <button
//                               onClick={() => deleteStaff(s._id)}
//                               className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition"
//                               title="Delete"
//                             >
//                               <TrashIcon className="h-4 w-4" />
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import API from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const STAFF_ROLES = [
  { value: "caregiver", label: "Caregiver" },
  { value: "teacher", label: "Teacher" },
  { value: "cook", label: "Cook" },
];

const roleBadge = (staffRole) => {
  const v = String(staffRole || "").toLowerCase();
  if (v === "teacher") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (v === "cook") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200"; // caregiver default
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function AdminDashboard() {
  const { user, logout } = React.useContext(AuthContext);

  // Staff state
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState(null); // {type, msg}
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    staffRole: "caregiver",
    experience: "",
    joiningDate: "",
  });

  // Children state
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null); // childId while assigning

  // Staff Activities state
  const [staffActivities, setStaffActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch staff activities
  const fetchStaffActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await API.get("/admin/staff-record");
      // Sort by latest first
      const sorted = (res.data.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setStaffActivities(sorted);
    } catch (err) {
      console.error("Failed to fetch staff activities:", err);
      setStatus({
        type: "error",
        msg: "Failed to load staff activity records.",
      });
      setStaffActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch on mount (add to existing useEffect)

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await API.get("/users/staff");
      setStaffList(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setStatus({ type: "error", msg: "Failed to load staff list." });
    } finally {
      setLoading(false);
    }
  };

  // Fetch children
  const fetchChildren = async () => {
    setChildrenLoading(true);
    try {
      const res = await API.get("/admin/getallchildren");
      setChildren(res.data || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to load children." });
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchChildren();
    fetchStaffActivities();
  }, []);

  // Staff stats
  const stats = useMemo(() => {
    const total = staffList.length;
    const caregiver = staffList.filter(
      (s) => s.staffRole === "caregiver"
    ).length;
    const teacher = staffList.filter((s) => s.staffRole === "teacher").length;
    const cook = staffList.filter((s) => s.staffRole === "cook").length;
    return { total, caregiver, teacher, cook };
  }, [staffList]);

  // Filtered staff
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staffList
      .filter((s) => {
        if (roleFilter !== "all" && s.staffRole !== roleFilter) return false;
        if (!q) return true;
        const hay = `${s.name || ""} ${s.email || ""} ${
          s.phone || ""
        }`.toLowerCase();
        return hay.includes(q);
      })
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [staffList, query, roleFilter]);

  // List of caregivers only (for dropdown)
  const caregivers = useMemo(() => {
    return staffList
      .filter((s) => s.staffRole === "caregiver")
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [staffList]);

  // Create staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStatus(null);
    setCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        staffRole: form.staffRole,
        experience:
          form.experience === "" ? undefined : Number(form.experience),
        joiningDate: form.joiningDate || undefined,
      };
      const res = await API.post("/users/staff", payload);
      const created = res.data?.data;
      const tempPassword = res.data?.tempPassword;

      setStaffList((prev) => [created, ...prev].filter(Boolean));
      setForm({
        name: "",
        email: "",
        phone: "",
        staffRole: "caregiver",
        experience: "",
        joiningDate: "",
      });
      setStatus({
        type: "success",
        msg: tempPassword
          ? `Staff created. Temporary password: ${tempPassword}`
          : "Staff created successfully.",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Failed to create staff.",
      });
    } finally {
      setCreating(false);
    }
  };

  // Delete staff
  const deleteStaff = async (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await API.delete(`/users/${id}`);
      setStaffList((prev) => prev.filter((s) => s._id !== id));
      setStatus({ type: "success", msg: "Staff deleted." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to delete staff." });
    }
  };

  // Assign caregiver
  const handleAssignCaregiver = async (childId, caregiverId) => {
    // Allow empty string to unassign
    setAssigningId(childId);
    try {
      await API.post("/admin/assign-caregiver", {
        childId,
        caregiverId: caregiverId || null, // backend should handle null/empty as unassign if needed
      });

      setChildren((prev) =>
        prev.map((c) =>
          c._id === childId ? { ...c, caregiver: caregiverId || null } : c
        )
      );

      setStatus({
        type: "success",
        msg: "Caregiver assigned successfully!",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Failed to assign caregiver.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleUpdateCaregiver = async (childId, caregiverId) => {
    setAssigningId(childId);
    try {
      await API.put(`/admin/assign-caregiver/${childId}`, {
        caregiverId: caregiverId || null,
      });

      // Update local state
      setChildren((prev) =>
        prev.map((c) =>
          c._id === childId ? { ...c, caregiver: caregiverId } : c
        )
      );

      setStatus({
        type: "success",
        msg: caregiverId
          ? "Caregiver assigned successfully!"
          : "Caregiver removed successfully!",
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Failed to update caregiver.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  // Helper to get caregiver name
  const getCaregiverName = (caregiverId) => {
    if (!caregiverId) return "None";
    const cg = staffList.find((s) => s._id === caregiverId);
    return cg ? cg.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
            <p className="text-sm text-slate-600">
              Staff management • children • caregiver assignment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-900">
                {user?.name || "Admin"}
              </div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Message */}
        {status?.type && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {status.msg}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Total Staff</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Caregivers</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.caregiver}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Teachers</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.teacher}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Cooks</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.cook}
            </div>
          </div>
        </div>

        {/* Staff Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Add Staff Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <UserPlusIcon className="h-5 w-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Add Staff</h2>
                  <p className="text-xs text-slate-500">
                    Create a staff account with a sub-role
                  </p>
                </div>
              </div>
              <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., Ayesha Rahman"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., staff@daycare.com"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Staff Role
                    </label>
                    <select
                      value={form.staffRole}
                      onChange={(e) =>
                        setForm({ ...form, staffRole: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.experience}
                      onChange={(e) =>
                        setForm({ ...form, experience: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) =>
                        setForm({ ...form, joiningDate: e.target.value })
                      }
                      className="w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-xl bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {creating ? "Creating..." : "Create Staff"}
                </button>
                <p className="text-xs text-slate-500">
                  A temporary password will be generated and shown after
                  creation.
                </p>
              </form>
            </div>
          </div>

          {/* Staff Directory Table */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Staff Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search, filter, and manage staff accounts
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name, email, phone"
                      className="pl-10 pr-3 py-2.5 rounded-xl border w-72 max-w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="py-2.5 rounded-xl border bg-white px-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="all">All roles</option>
                    {STAFF_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchStaff}
                    className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition"
                    title="Refresh"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-10 text-center text-slate-500">
                  Loading staff…
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  No staff found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left bg-slate-50 border-b">
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Staff
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Role
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Contact
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Experience
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Joining
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Added
                        </th>
                        <th className="py-3.5 px-4 font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr
                          key={s._id}
                          className="border-b last:border-b-0 hover:bg-slate-50/60"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {s.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {s.email}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${roleBadge(
                                s.staffRole
                              )}`}
                            >
                              {String(s.staffRole).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {s.phone || "-"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {s.experience !== undefined
                              ? `${s.experience} yrs`
                              : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {fmtDate(s.joiningDate)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {fmtDate(s.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => deleteStaff(s._id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition text-sm"
                            >
                              <TrashIcon className="h-4 w-4" />
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
        </div>

        {/* Children & Caregiver Assignment Section */}
        {/* Children & Caregiver Assignment Section - Updated */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <UserPlusIcon className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Children & Caregiver Management
                </h2>
                <p className="text-xs text-slate-500">
                  Assign, update, or remove caregivers for each child
                </p>
              </div>
            </div>
            <button
              onClick={fetchChildren}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {childrenLoading ? (
            <div className="py-10 text-center text-slate-500">
              Loading children…
            </div>
          ) : children.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No children registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50 border-b">
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Child
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Date of Birth
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Parent
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Current Caregiver
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child) => (
                    <tr
                      key={child._id}
                      className="border-b last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {child.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {child._id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {child.dateOfBirth
                          ? new Date(child.dateOfBirth).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {child.parent?.name || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${
                            child.caregiver
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {getCaregiverName(child.caregiver)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {/* Assign / Update Caregiver Dropdown */}
                          <select
                            value={child.caregiver || ""}
                            disabled={assigningId === child._id}
                            onChange={(e) => {
                              const newCaregiverId = e.target.value || null;
                              handleUpdateCaregiver(child._id, newCaregiverId);
                            }}
                            className="rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          >
                            <option value="">— No caregiver —</option>
                            {caregivers.map((cg) => (
                              <option key={cg._id} value={cg._id}>
                                {cg.name} ({cg.email})
                              </option>
                            ))}
                          </select>

                          {/* Explicit Remove Button */}
                          {child.caregiver && (
                            <button
                              onClick={() =>
                                handleUpdateCaregiver(child._id, null)
                              }
                              disabled={assigningId === child._id}
                              className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60 transition flex items-center gap-1.5"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Remove
                            </button>
                          )}

                          {assigningId === child._id && (
                            <span className="text-xs text-slate-500">
                              saving…
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ==================== STAFF ACTIVITY RECORDS SECTION ==================== */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <ArrowPathIcon className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Staff Activity Log
                </h2>
                <p className="text-xs text-slate-500">
                  All recorded activities from caregivers, teachers, and cooks
                </p>
              </div>
            </div>
            <button
              onClick={fetchStaffActivities}
              disabled={activitiesLoading}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border hover:bg-slate-50 transition disabled:opacity-60"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${activitiesLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {activitiesLoading ? (
            <div className="py-10 text-center text-slate-500">
              Loading activities…
            </div>
          ) : staffActivities.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No staff activities recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50 border-b">
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Staff Member
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Role
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Activity
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-700">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffActivities.map((activity) => {
                    const staff = staffList.find(
                      (s) => s._id === activity.staffId
                    );
                    return (
                      <tr
                        key={activity._id}
                        className="border-b last:border-b-0 hover:bg-slate-50/60"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">
                            {staff?.name || "Unknown Staff"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {staff?.email || "-"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${roleBadge(
                              staff?.staffRole
                            )}`}
                          >
                            {staff?.staffRole?.toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {activity.activityname}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
