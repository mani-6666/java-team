import UserLayout from "../usercomponents/UserLayout";
import { useState, useMemo } from "react";
import { FileText, Search, ChevronDown, ChevronUp } from "lucide-react";

const materialsData = [
  {
    id: 1,
    title: "Mathematics Previous Paper",
    description: "Comprehensive guide covering all topics",
    filterName: "Test Paper",
    type: "PDF",
    size: "3.8 MB",
    uploadedAt: "2024-10-15",
    pdfUrl: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf"
  },
  {
    id: 2,
    title: "Mathematics Exam Solutions",
    description: "Chapter-wise solved problems",
    filterName: "Model Question Paper",
    type: "PDF",
    size: "3.2 MB",
    uploadedAt: "2024-10-15",
    pdfUrl: "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf"
  },
  {
    id: 3,
    title: "Chemistry Exam Questions",
    description: "Complete lab procedures and safety guidelines",
    filterName: "Mock Test Paper",
    type: "PDF",
    size: "4.1 MB",
    uploadedAt: "2024-10-15",
    pdfUrl: "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf"
  },
  {
    id: 4,
    title: "Model Question Paper 2024",
    description: "Based on updated exam pattern",
    filterName: "Model Question Paper",
    type: "PDF",
    size: "2.5 MB",
    uploadedAt: "2024-10-12",
    pdfUrl: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf"
  },
  {
    id: 5,
    title: "Programming Questions",
    description: "Based on updated exam pattern",
    filterName: "Model Question Paper",
    type: "PDF",
    size: "2.5 MB",
    uploadedAt: "2024-10-12",
    pdfUrl: "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf"
  }
];

const categoryFilters = ["Materials", "Model Question Paper", "Test Paper", "Mock Test Paper"];

function MaterialRow({ material, activeFilter }) {
  const handleViewPDF = () => window.open(material.pdfUrl, "_blank");

  return (
    <div className="
      flex flex-col md:flex-row md:items-center justify-between gap-4
      bg-white dark:bg-[#0F1216]
      border border-gray-200 dark:border-gray-700
      rounded-xl px-5 py-4 shadow-sm
    ">
      <div className="flex gap-4 items-start">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <FileText size={20} className="text-blue-600" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">
            {material.title}
          </h3>

          <p className="text-xs md:text-[13px] text-gray-600 dark:text-gray-300">
            {material.description}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {activeFilter === "Materials" ? material.filterName : activeFilter}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="px-2 py-[2px] rounded-md bg-red-500 text-white text-[11px]">
              PDF
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">{material.size}</span>
            <span className="w-1 h-1 rounded-full bg-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              Uploaded: {material.uploadedAt}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleViewPDF}
        className="w-full md:w-auto px-5 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
      >
        View
      </button>
    </div>
  );
}

export default function StudyMaterials() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Materials");
  const [dropdown, setDropdown] = useState(false);

  const filteredMaterials = useMemo(() => {
    return materialsData.filter((m) => {
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || m.title.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "Materials" ||
        m.filterName.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <UserLayout>
      <div className="
        w-full min-h-screen 
        bg-gray-50 dark:bg-[#0B0F14]
        px-2 sm:px-4 
        pt-1 pb-6
      ">
        <div className="max-w-6xl mx-auto space-y-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-semibold text-gray-900 dark:text-white">
                Study Materials
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access learning resources provided by your organization
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

              <div className="relative flex-1 min-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title"
                  className="
                    w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300
                    bg-white dark:bg-gray-900 text-sm
                    outline-none focus:ring-2 focus:ring-blue-500
                  "
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="
                    px-4 py-2 rounded-lg border border-gray-300 
                    bg-white dark:bg-gray-900 text-sm min-w-[150px]
                    flex items-center justify-between
                  "
                >
                  {categoryFilter}
                  {dropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {dropdown && (
                  <div className="
                    absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 
                    border border-gray-200 rounded-lg shadow-lg z-50 py-1
                  ">
                    {categoryFilters
                      .filter((f) => f !== categoryFilter)
                      .map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setCategoryFilter(option);
                            setDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {option}
                        </button>
                      ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="space-y-3 pb-10">
            {filteredMaterials.length === 0 ? (
              <div className="mt-6 p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                No materials found
              </div>
            ) : (
              filteredMaterials.map((m) => (
                <MaterialRow key={m.id} material={m} activeFilter={categoryFilter} />
              ))
            )}
          </div>

        </div>
      </div>
    </UserLayout>
  );
}
