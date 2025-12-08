
import React, { useState } from "react";
import { X, Camera } from "lucide-react";

export default function InvProfile({ onClose }) {
  const [isEditing, setIsEditing] = useState(false);

  const [data, setData] = useState({
    fullName: "Peter Thomas",
    email: "peter.thom@example.com",
    phone: "+91 1234567890",
    invigilatorId: "INV001",
    organizationName: "Tech University",
    organizationId: "Tech001",
    gender: "Male",
    age: "32",
    joinDate: "2025-02-01",
    avatar: "https://i.ibb.co/7QpKsCX/avatar-default.png"
  });

  const [editData, setEditData] = useState({ ...data });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex justify-center items-center p-6">

      {/* PROFILE CARD */}
      <div className="
        bg-white dark:bg-[#1f1f23]
        rounded-xl shadow-xl p-10
        w-[55%] max-h-[90vh] overflow-y-auto relative
        border border-gray-200 dark:border-[#2f2f33]
        transition-all
      ">

        {/* CLOSE BUTTON */}
        <button
          className="absolute top-6 right-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          User Profile
        </h1>

        {/* PROFILE IMAGE */}
        <div className="flex justify-center mb-8 relative">
          <img
            src={editData.avatar}
            alt="Profile"
            className="
              w-28 h-28 rounded-full object-cover 
              border-4 border-gray-200 dark:border-[#3a3a3f]
            "
          />

          <button
            className="
              absolute bottom-1 right-[43%]
              bg-white dark:bg-[#2b2b2f]
              shadow p-2 rounded-full border
              hover:bg-gray-100 dark:hover:bg-[#3a3a3f]
            "
          >
            <Camera className="w-4 h-4 text-indigo-600" />
          </button>
        </div>

        {/* INPUT FIELDS */}
        <InputField
          label="Full Name"
          name="fullName"
          value={editData.fullName}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        <InputField
          label="Email"
          name="email"
          value={editData.email}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        <InputField
          label="Phone"
          name="phone"
          value={editData.phone}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        <InputField
          label="Invigilator ID"
          name="invigilatorId"
          value={editData.invigilatorId}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        <InputField
          label="Organization Name"
          name="organizationName"
          value={editData.organizationName}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        <InputField
          label="Organization ID"
          name="organizationId"
          value={editData.organizationId}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        {/* GENDER + AGE */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <InputField
            label="Gender"
            name="gender"
            value={editData.gender}
            readOnly={!isEditing}
            onChange={handleChange}
          />
          <InputField
            label="Age"
            name="age"
            value={editData.age}
            readOnly={!isEditing}
            onChange={handleChange}
          />
        </div>

        {/* JOINING DATE */}
        <InputField
          label="Joining Date"
          name="joinDate"
          value={editData.joinDate}
          readOnly={!isEditing}
          onChange={handleChange}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mt-10">

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="
                px-10 py-3 
                border border-indigo-600 text-indigo-600
                rounded-md hover:bg-indigo-50
                dark:text-indigo-400 dark:border-indigo-400
                dark:hover:bg-[#2a2d34]
              "
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="
                  px-10 py-3 bg-indigo-600 text-white rounded-md
                  hover:bg-indigo-700
                "
              >
                Save
              </button>

              <button
                onClick={handleCancel}
                className="
                  px-10 py-3 bg-gray-400 dark:bg-[#3a3a3f]
                  text-white rounded-md hover:bg-gray-500
                "
              >
                Cancel
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}


/* ---------------- INPUT COMPONENT ---------------- */
function InputField({ label, name, readOnly, value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
        {label}
      </label>

      <input
        type="text"
        name={name}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        className={`
          w-full border rounded-md p-3 transition-all
          ${readOnly
            ? "bg-gray-100 dark:bg-[#2a2a2e] border-gray-300 dark:border-[#3a3a3f] text-gray-800 dark:text-gray-200"
            : "bg-white dark:bg-[#1f1f23] border-gray-400 dark:border-[#4a4a4f] text-gray-900 dark:text-gray-100"
          }
        `}
      />
    </div>
  );
}
