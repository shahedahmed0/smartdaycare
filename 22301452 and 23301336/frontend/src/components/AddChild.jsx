import React, { useState } from "react";
import axios from "axios";
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const AddChild = ({ onChildAdded, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "male",
    allergies: "",
    medicalNotes: "",
    guardianInfo: {
      primaryGuardian: {
        name: "",
        relationship: "",
        phone: "",
        email: "",
      },
      secondaryGuardian: {
        name: "",
        relationship: "",
        phone: "",
        email: "",
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------
  // GENERAL INPUT HANDLER
  // ----------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: {
            ...prev[parent][child],
            [field]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ----------------------------------
  // SUBMIT HANDLER
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const allergiesArray = formData.allergies
        ? formData.allergies.split(",").map((a) => a.trim())
        : [];

      const response = await axios.post(
        "http://localhost:5000/api/children",
        {
          ...formData,
          allergies: allergiesArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onChildAdded(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register child");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // UI
  // ----------------------------------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full animate-fadeIn mt-10 mb-20">

        {/* HEADER */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Register New Child
          </h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* ERROR */}
          {error && (
            <div className="bg-red-100 border border-red-400 rounded-lg px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* BASIC INFORMATION */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Child's Name *
                  </label>
                  <div className="flex items-center border rounded-md px-3">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full py-2 outline-none"
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                    max="12"
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Date of Birth *
                  </label>
                  <div className="flex items-center border rounded-md px-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      className="w-full py-2 outline-none"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* MEDICAL INFORMATION */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Medical Information
              </h3>
              <div className="space-y-4">

                {/* Allergies */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Allergies (comma-separated)
                  </label>
                  <div className="flex items-center border rounded-md px-3">
                    <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="Peanuts, Dairy, Pollen"
                      className="w-full py-2 outline-none"
                    />
                  </div>
                </div>

                {/* Medical Notes */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Medical Notes
                  </label>
                  <textarea
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                    placeholder="Any important information..."
                  />
                </div>
              </div>
            </section>

            {/* PRIMARY GUARDIAN */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Primary Guardian
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Guardian Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="guardianInfo.primaryGuardian.name"
                    value={formData.guardianInfo.primaryGuardian.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="guardianInfo.primaryGuardian.relationship"
                    value={formData.guardianInfo.primaryGuardian.relationship}
                    onChange={handleChange}
                    placeholder="Mother, Father..."
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Phone</label>
                  <div className="flex items-center border rounded-md px-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="tel"
                      name="guardianInfo.primaryGuardian.phone"
                      value={formData.guardianInfo.primaryGuardian.phone}
                      onChange={handleChange}
                      className="w-full py-2 outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Email</label>
                  <div className="flex items-center border rounded-md px-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      type="email"
                      name="guardianInfo.primaryGuardian.email"
                      value={formData.guardianInfo.primaryGuardian.email}
                      onChange={handleChange}
                      className="w-full py-2 outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECONDARY GUARDIAN */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Secondary Guardian (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="guardianInfo.secondaryGuardian.name"
                    value={formData.guardianInfo.secondaryGuardian.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="guardianInfo.secondaryGuardian.relationship"
                    value={formData.guardianInfo.secondaryGuardian.relationship}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    name="guardianInfo.secondaryGuardian.phone"
                    value={formData.guardianInfo.secondaryGuardian.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="guardianInfo.secondaryGuardian.email"
                    value={formData.guardianInfo.secondaryGuardian.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md outline-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? "Registering..." : "Register Child"}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default AddChild;
