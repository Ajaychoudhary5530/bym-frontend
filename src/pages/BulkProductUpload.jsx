import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function BulkProductUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const csv = "name,variant,unit,category,openingQty,avgPurchasePrice\n";

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "product_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadCSV = async () => {
    try {
      setError("");
      setMsg("");

      if (!file) {
        setError("Please select a CSV file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      setLoading(true);

      // ✅ Correct endpoint based on server.js mounting:
      // baseURL = http://localhost:5000/api
      // final = http://localhost:5000/api/products/bulk-upload
      const res = await api.post("/products/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg(res.data?.message || "Bulk upload successful");

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-3xl">
        <h2 className="text-xl font-bold mb-2">Bulk Product Upload</h2>

        <p className="text-sm text-gray-600 mb-4">
          Required CSV columns:
          <br />
          <b>name, variant, unit, category, openingQty, avgPurchasePrice</b>
        </p>

        <button
          onClick={downloadTemplate}
          className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
        >
          Download CSV Template
        </button>

        {msg && (
          <p className="bg-green-50 text-green-700 border border-green-200 p-2 rounded mb-3">
            {msg}
          </p>
        )}

        {error && (
          <p className="bg-red-50 text-red-700 border border-red-200 p-2 rounded mb-3">
            {error}
          </p>
        )}

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 block"
        />

        <div className="flex gap-2">
          <button
            onClick={uploadCSV}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Uploading..." : "Upload CSV"}
          </button>

          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="border px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
