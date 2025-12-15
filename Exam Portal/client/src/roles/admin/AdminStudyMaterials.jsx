// src/adminPages/AdminStudyMaterials.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../adminComponents/AdminLayout";
import { Upload, Trash2, Edit, X, Download } from "lucide-react";
import { storage } from "../firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const API_BASE = "http://localhost:5000/admin/study-materials";

export default function AdminStudyMaterials() {
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Organization name used in folder path. Replace or set dynamically from auth
  const orgName = localStorage.getItem("orgName") || "ExamMarkPro";

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    file: null,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (data.success) setMaterials(data.data || []);
      else setMaterials([]);
    } catch (err) {
      console.error("Fetch materials error:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------
     Helper: determine file type & size
     Type required: PDF | DOC | PPT (fallback File)
  --------------------------------*/
  function getFileMeta(file) {
    if (!file) return { type: null, size: null };

    const name = (file.name || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    let type = "File";
    if (name.endsWith(".pdf") || mime.includes("pdf")) type = "PDF";
    else if (name.endsWith(".doc") || name.endsWith(".docx") || mime.includes("word")) type = "DOC";
    else if (name.endsWith(".ppt") || name.endsWith(".pptx") || mime.includes("presentation")) type = "PPT";

    const bytes = file.size || 0;
    let sizeStr = "0 B";
    if (bytes >= 1024 * 1024) sizeStr = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    else if (bytes >= 1024) sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
    else sizeStr = `${bytes} B`;

    return { type, size: sizeStr };
  }

  /* ------------------------------
     Modal opener (must exist)
  --------------------------------*/
  const openUploadModal = (item = null) => {
    setEditItem(item);

    setForm({
      title: item?.title || "",
      category: item?.category || "",
      description: item?.description || "",
      file: null,
    });

    setOpenModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((p) => ({
      ...p,
      [name]: files ? files[0] : value,
    }));
  };

  /* =========================================================
     uploadToFirebase (structured path)
     Returns { url, token, path }
  ========================================================== */
  async function uploadToFirebase(file, category, fileType) {
    if (!file) return null;

    const typeFolder = fileType || (() => {
      const name = (file.name || "").toLowerCase();
      if (name.endsWith(".pdf")) return "PDF";
      if (name.endsWith(".doc") || name.endsWith(".docx")) return "DOC";
      if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "PPT";
      return "Others";
    })();

    const safeCategory = (category || "Uncategorized").replace(/\s+/g, "_");
   const filePath = `Docs/${orgName}/${typeFolder}/${safeCategory}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

    const refPath = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(refPath, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const token = url.includes("token=") ? url.split("token=")[1] : null;
          resolve({ url, token, path: filePath });
        }
      );
    });
  }

  /* =========================================================
     deleteFromFirebase by stored filePath
  ========================================================== */
  async function deleteFromFirebase(path) {
    if (!path) return;
    try {
      const refToDelete = storageRef(storage, path);
      await deleteObject(refToDelete);
    } catch (err) {
      // ignore - file might already be removed or path invalid
      console.log("deleteFromFirebase:", err.message);
    }
  }

  /* =========================================================
     handleSubmit (create / edit)
     - calculates type & size in frontend
     - uploads file if provided
     - sends JSON to backend with type,size,fileURL,filePath,token
  ========================================================== */
  const handleSubmit = async () => {
    if (!form.title || !form.category) {
      alert("Please fill Title and Category");
      return;
    }

    try {
      setLoading(true);

      // prepare meta from file (if selected)
      const fileMeta = getFileMeta(form.file);
      let uploaded = null;
      if (form.file) {
        // upload with folder structure using calculated type
        uploaded = await uploadToFirebase(form.file, form.category, fileMeta.type);
      }

      // payload to backend
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description || null,
        type: fileMeta.type || (editItem?.type || "File"),
        size: fileMeta.size || (editItem?.size || null),
        fileURL: uploaded?.url || editItem?.fileurl || null,
        filePath: uploaded?.path || editItem?.filepath || null,
        token: uploaded?.token || editItem?.token || null,
      };

      if (editItem) {
        // if replaced file is uploaded, try to delete old file from firebase (frontend responsibility)
        if (uploaded && editItem?.filepath) {
          try {
            await deleteFromFirebase(editItem.filepath);
          } catch (err) {
            console.log("Failed to delete previous firebase file:", err.message);
          }
        }

        await fetch(`${API_BASE}/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      // reset & refresh
      setOpenModal(false);
      setEditItem(null);
      setForm({ title: "", category: "", description: "", file: null });
      await fetchMaterials();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Upload failed — check console");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     handleDelete (frontend deletes firebase file by filepath then DB)
  ========================================================== */
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this material?")) return;

    try {
      // delete from firebase (if path exists)
      if (item.filepath) await deleteFromFirebase(item.filepath);

      // delete DB row
      await fetch(`${API_BASE}/${item.id}`, { method: "DELETE" });

      await fetchMaterials();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed — check console");
    }
  };

  /* =========================================================
     handleDownload increments counter and opens URL
  ========================================================== */
  const handleDownload = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/download/${id}`);
      const data = await res.json();
      if (data.success && data.url) window.open(data.url, "_blank");
      else alert("No file URL available");
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  /* UI filtering (search) */
  const filteredMaterials = materials.filter((m) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (m.title || "").toLowerCase().includes(s) ||
      (m.category || "").toLowerCase().includes(s) ||
      (m.uploadedby || m.uploadedBy || "admin").toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-1">Study Materials</h1>
      <p className="text-gray-500 mb-4">Upload and manage study resources</p>

      {/* Search + Upload Button */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <input
          type="text"
          placeholder="Search Title, Category, or Uploaded By"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-3 rounded-lg w-full md:max-w-2xl bg-white text-black"
        />

        <button
          onClick={() => openUploadModal(null)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Upload size={16} />
          Upload Material
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">All Materials</h2>
          <div className="text-sm text-gray-500">{loading ? "Loading..." : `${materials.length} items`}</div>
        </div>

        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50 text-gray-700">
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

            <tbody>
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="border-b border-gray-200">
                  <td className="p-3">{m.title}</td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3">{m.type || "File"}</td>
                  <td className="p-3">{m.size || "-"}</td>
                  <td className="p-3">{m.downloads ?? 0}</td>
                  <td className="p-3">{m.date || "-"}</td>
                  <td className="p-3">{m.uploadedby || m.uploadedBy || "Admin"}</td>

                  <td className="p-3 flex gap-3">
                    <button onClick={() => openUploadModal(m)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <Edit size={16} />
                    </button>

                    <button onClick={() => handleDelete(m)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 size={16} />
                    </button>

                    <button onClick={() => handleDownload(m.id)} className="text-green-600 hover:text-green-800" title="Download">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No materials found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload / Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{editItem ? "Edit Material" : "Upload Material"}</h2>
              <button onClick={() => { setOpenModal(false); setEditItem(null); }} className="text-black">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-700">Title</label>
                <input name="title" value={form.title} onChange={handleFormChange} placeholder="Material title"
                  className="w-full border rounded-lg mt-1 p-2 bg-white" />
              </div>

              <div>
                <label className="text-sm text-gray-700">Category</label>
                <input name="category" value={form.category} onChange={handleFormChange} placeholder="Category (e.g., Physics)"
                  className="w-full border rounded-lg mt-1 p-2 bg-white" />
              </div>

              <div>
                <label className="text-sm text-gray-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Short description"
                  className="w-full border rounded-lg mt-1 p-2 bg-white h-24 resize-none" />
              </div>

              <div>
                <label className="text-sm text-gray-700">Select File {editItem ? "(leave empty to keep existing file)" : ""}</label>
                <input type="file" name="file" onChange={handleFormChange}
                  className="w-full border rounded-lg mt-1 p-2 bg-white" />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setOpenModal(false); setEditItem(null); }} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-blue-600 text-white">{loading ? "Please wait..." : "Submit"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
