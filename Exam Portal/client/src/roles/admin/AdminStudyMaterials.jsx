import React, { useState } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import { Upload, Trash2, Edit, X } from "lucide-react";

export default function AdminStudyMaterials() {
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [materials, setMaterials] = useState([
    {
      title: "Mathematics Guide",
      category: "Mathematics",
      type: "PDF",
      size: "2.5 MB",
      downloads: 456,
      date: "2024-10-15",
      uploadedBy: "Rohit Sharma",
    },
    {
      title: "Physics Notes",
      category: "Physics",
      type: "PDF",
      size: "3.5 MB",
      downloads: 380,
      date: "2024-10-10",
      uploadedBy: "Rashmi Patil",
    },
    {
      title: "Chemistry Lab Manual",
      category: "Chemistry",
      type: "PDF",
      size: "2 MB",
      downloads: 520,
      date: "2024-10-20",
      uploadedBy: "Rohan Gupta",
    },
    {
      title: "Programming Basics",
      category: "CS",
      type: "Video",
      size: "3 MB",
      downloads: 300,
      date: "2024-10-15",
      uploadedBy: "Varsha Mehta",
    },
    {
      title: "Biology Summary Notes",
      category: "Biology",
      type: "PDF",
      size: "4.2 MB",
      downloads: 610,
      date: "2024-09-12",
      uploadedBy: "Aditi Mishra",
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredMaterials = materials.filter((m) => {
    const s = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(s) ||
      m.category.toLowerCase().includes(s) ||
      m.uploadedBy.toLowerCase().includes(s)
    );
  });

  const [form, setForm] = useState({
    class: "",
    title: "",
    category: "",
    filename: "",
    file: null,
  });

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.filename) {
      alert("Please fill all fields!");
      return;
    }

    const fileType = form.file
      ? form.file.type.includes("pdf")
        ? "PDF"
        : "File"
      : "PDF";

    const fileSize = form.file
      ? (form.file.size / (1024 * 1024)).toFixed(1) + " MB"
      : "2 MB";

    const newMaterial = {
      title: form.title,
      category: form.category,
      type: fileType,
      size: fileSize,
      downloads: editIndex !== null ? materials[editIndex].downloads : 0,
      date:
        editIndex !== null
          ? materials[editIndex].date
          : new Date().toISOString().split("T")[0],
      uploadedBy: editIndex !== null ? materials[editIndex].uploadedBy : "Admin",
    };

    if (editIndex !== null) {
      const updated = [...materials];
      updated[editIndex] = newMaterial;
      setMaterials(updated);
      setEditIndex(null);
    } else {
      setMaterials((prev) => [newMaterial, ...prev]);
    }

    setForm({
      class: "",
      title: "",
      category: "",
      filename: "",
      file: null,
    });

    setOpenModal(false);
  };

  const handleDelete = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const data = materials[index];
    setForm({
      class: "",
      title: data.title,
      category: data.category,
      filename: data.title.replace(/\s+/g, "_"),
      file: null,
    });

    setEditIndex(index);
    setOpenModal(true);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">Study Materials</h1>
      <p className="text-gray-500 mb-8">Upload and manage study resources</p>

     
   <input
  type="text"
  placeholder="Search Title, Category, or Uploaded By"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    border px-4 py-3 rounded-lg w-full md:max-w-2xl
    bg-white text-black
    dark:bg-[#0b0b0b] dark:text-white dark:border-gray-600
    placeholder-gray-500 dark:placeholder-gray-300
  "
/>


      <div className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
          <h2 className="font-semibold text-lg">All Materials</h2>

          <button
            onClick={() => {
              setEditIndex(null);
              setForm({
                class: "",
                title: "",
                category: "",
                filename: "",
                file: null,
              });
              setOpenModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
          >
            <Upload size={18} />
            Upload Materials
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50 dark:bg-[#1b1b2e] text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Downloads</th>
                <th className="p-3">Upload Date</th>
                <th className="p-3">Upload By</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm sm:text-base">
              {filteredMaterials.map((m, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3">{m.title}</td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">{m.size}</td>
                  <td className="p-3">{m.downloads}</td>
                  <td className="p-3">{m.date}</td>
                  <td className="p-3">{m.uploadedBy}</td>

                  <td className="p-3 flex gap-4">
                    <button onClick={() => handleEdit(i)} className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>

                    <button onClick={() => handleDelete(i)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    
 {openModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999] p-4">
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl w-full max-w-md p-6 shadow-xl relative text-black dark:text-white">

     
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {editIndex !== null ? "Edit Material" : "Upload Material"}
        </h2>
        <button onClick={() => setOpenModal(false)} className="text-black dark:text-white">
          <X size={22} />
        </button>
      </div>

  
      <div className="flex flex-col gap-4">

    
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">Organization Name</label>
          <input
            name="title"
            value={form.title}
            placeholder="Tech University"
            onChange={handleFormChange}
            className="
              w-full border rounded-lg mt-1 p-2 text-base
              bg-white text-black
              dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600
            "
          />
        </div>

       
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">Description</label>
          <input
            name="category"
            value={form.category}
            placeholder="Description"
            onChange={handleFormChange}
            className="
              w-full border rounded-lg mt-1 p-2 text-base
              bg-white text-black
              dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600
            "
          />
        </div>

 
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300">Select File</label>
          <input
            type="file"
            name="file"
            onChange={handleFormChange}
            className="
              w-full border rounded-lg mt-1 p-2 text-base
              bg-white text-black
              dark:bg-[#1a1a1a] dark:text-white dark:border-gray-600
            "
          />
        </div>

      
        <div className="flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg shadow text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </AdminLayout>
  );
}
