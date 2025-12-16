import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { Upload, Trash2, Edit, X, Download } from "lucide-react";

const API = "http://localhost:5000/admin/study-materials";

export default function AdminStudyMaterials() {
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    class: "",
    title: "",
    category: "",
    filename: "",
    file: null,
  });

  const loadMaterials = async () => {
    try {
      const res = await axios.get(API);
      setMaterials(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const s = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(s) ||
      m.category.toLowerCase().includes(s) ||
      m.uploaded_by.toLowerCase().includes(s)
    );
  });

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      alert("Please fill all fields!");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("className", form.class);
    data.append("category", form.category);
    data.append("type", "PDF");
    if (form.file) data.append("file", form.file);

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, {
          title: form.title,
          className: form.class,
          category: form.category,
          type: "PDF",
        });
      } else {
        await axios.post(API, data);
      }

      setOpenModal(false);
      setEditId(null);
      loadMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (material) => {
    setForm({
      class: material.class,
      title: material.title,
      category: material.category,
      filename: material.title.replace(/\s+/g, "_"),
      file: null,
    });

    setEditId(material.id);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      loadMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await axios.get(`${API}/download/${id}`);
      window.open(res.data.url, "_blank");
      loadMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="dark:text-white">

        <h1 className="text-2xl font-bold mb-1 dark:text-white">Study Materials</h1>
        <p className="text-gray-500 mb-8 dark:text-gray-300">
          Upload and manage study resources
        </p>

        {/* SEARCH */}
        <div className="mb-6 flex justify-center px-2">
          <input
            type="text"
            placeholder="Search Title, Category, or Uploaded By"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-3 rounded-lg w-full md:max-w-2xl 
            dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* TABLE WRAPPER */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="font-semibold text-lg dark:text-white">All Materials</h2>

            <button
              onClick={() => {
                setForm({ class: "", title: "", category: "", filename: "", file: null });
                setEditId(null);
                setOpenModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg 
              w-full sm:w-auto justify-center"
            >
              <Upload size={18} /> Upload
            </button>
          </div>

          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-blue-50 dark:bg-gray-700 dark:text-white">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Downloads</th>
                <th className="p-3">Uploaded Date</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="border-b dark:border-gray-700 dark:text-white">
                  <td className="p-3">{m.title}</td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3">{m.type}</td>
                  <td className="p-3">{m.file_size}</td>
                  <td className="p-3">{m.download_count}</td>
                  <td className="p-3">{m.upload_date}</td>
                  <td className="p-3">{m.uploaded_by}</td>

                  <td className="p-3 flex gap-4 flex-wrap">
                    <button onClick={() => handleDownload(m.id)}>
                      <Download size={18} className="text-green-600 dark:text-green-400" />
                    </button>

                    <button
                      onClick={() => handleEdit(m)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[999]">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-5 shadow-xl dark:text-white">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editId ? "Edit Material" : "Upload Material"}
                </h2>
                <X size={22} className="cursor-pointer" onClick={() => setOpenModal(false)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* UPDATED: CLASS TEXTBOX INSTEAD OF SELECT */}
                <div>
                  <label className="dark:text-white">Class</label>
                  <input
                    name="class"
                    value={form.class}
                    onChange={handleFormChange}
                    placeholder="Enter class, e.g., Class 6"
                    className="border rounded-lg w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="dark:text-white">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="border rounded-lg w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="dark:text-white">Category</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="border rounded-lg w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="dark:text-white">File Name</label>
                  <input
                    name="filename"
                    value={form.filename}
                    onChange={handleFormChange}
                    placeholder="example: maths_chapter1"
                    className="border rounded-lg w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="dark:text-white">Select File</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleFormChange}
                    className="border rounded-lg w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

              </div>

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg w-full mt-6"
              >
                {editId ? "Update" : "Submit"}
              </button>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
