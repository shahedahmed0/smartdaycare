import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PhotoIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const ActivityForm = ({ onCreated }) => {
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState({
    childId: "",
    activityType: "activity",
    title: "",
    description: "",
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // load children list automatically on open
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/children", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChildren(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch children", error);
      }
    };
    fetchChildren();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    // preview images
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const submitActivity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");

      // 1) Create activity entry
      const createRes = await axios.post(
        "http://localhost:5000/api/activities",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const activity = createRes.data.data;

      // 2) Upload photos if selected
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((p) => fd.append("photos", p));

        await axios.post(
          `http://localhost:5000/api/activities/${activity._id}/photos`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setStatus({ type: "success", msg: "Activity created successfully!" });

      // reset form
      setForm({
        childId: "",
        activityType: "activity",
        title: "",
        description: "",
      });
      setPhotos([]);
      setPhotoPreviews([]);

      onCreated && onCreated();
    } catch (error) {
      setStatus({
        type: "error",
        msg:
          error.response?.data?.message ||
          "Failed to create activity. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
        Log New Activity
      </h2>

      {/* STATUS BANNERS */}
      {status?.type === "success" && (
        <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-300">
          {status.msg}
        </div>
      )}
      {status?.type === "error" && (
        <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg border border-red-300">
          {status.msg}
        </div>
      )}

      <form onSubmit={submitActivity} className="space-y-5">
        
        {/* CHILD DROPDOWN */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Child</label>
          <div className="relative">
            <select
              name="childId"
              value={form.childId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg appearance-none bg-white"
              required
            >
              <option value="">Select...</option>
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name} ({child.age} yrs)
                </option>
              ))}
            </select>
            <ChevronDownIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* ACTIVITY TYPE */}
        <div>
          <label className="block text-sm font-medium mb-1">Activity Type</label>
          <select
            name="activityType"
            value={form.activityType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="activity">Activity</option>
            <option value="meal">Meal</option>
            <option value="nap">Nap</option>
            <option value="update">General Update</option>
          </select>
        </div>

        {/* TITLE */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="E.g. Lunch Time, Playtime, Nap"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write notes or details about the activity..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* PHOTO UPLOAD */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Photos (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-blue-50 border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center gap-2">
              <PhotoIcon className="h-5 w-5" />
              Choose Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              {photos.length > 0 && `${photos.length} selected`}
            </span>
          </div>

          {/* Preview */}
          {photoPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {photoPreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  className="w-full h-24 object-cover rounded-lg shadow"
                  alt="preview"
                />
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-sm"
          >
            {loading ? "Saving..." : "Save Activity"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
