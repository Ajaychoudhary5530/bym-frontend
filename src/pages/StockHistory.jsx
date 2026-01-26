import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StockHistory() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productId, setProductId] = useState("");

  // 🔍 NEW FILTER STATES
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const loadHistory = async () => {
    const params = {};
    if (from && to) {
      params.from = from;
      params.to = to;
    }
    if (productId) params.productId = productId;

    const res = await api.get("/stock/history", { params });
    setLogs(res.data);
  };

  const exportExcel = async () => {
    const res = await api.get("/stock/export", {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "stock-history.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const previewInvoice = (pdfUrl) => {
    if (!pdfUrl) return;
    window.open(
      `http://localhost:5000${pdfUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // 🔍 FRONTEND SEARCH + FILTER
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase();

      const matchSearch =
        l.productId?.name?.toLowerCase().includes(q) ||
        l.invoiceNo?.toLowerCase().includes(q) ||
        l.userId?.email?.toLowerCase().includes(q);

      const matchType = typeFilter ? l.type === typeFilter : true;

      return matchSearch && matchType;
    });
  }, [logs, search, typeFilter]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold">Stock History</h2>

          <div className="flex gap-2">
            {/* ✅ HOME BUTTON */}
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              Home
            </button>

            <button
              onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder="Search product / invoice / user"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />

          {/* TYPE FILTER */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>

          <button
            onClick={loadHistory}
            className="bg-blue-600 text-white rounded"
          >
            Apply
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-2">Product</th>
                <th className="border px-2 py-2">Type</th>
                <th className="border px-2 py-2">Qty</th>
                <th className="border px-2 py-2">Invoice No</th>
                <th className="border px-2 py-2">Date</th>
                <th className="border px-2 py-2">User</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {filteredLogs.map((l) => (
                <tr key={l._id}>
                  <td className="border px-2 py-1">{l.productId?.name}</td>
                  <td className="border px-2 py-1 text-center">{l.type}</td>
                  <td className="border px-2 py-1 text-center">{l.quantity}</td>

                  <td className="border px-2 py-1 text-center">
                    {l.invoicePdfUrl ? (
                      <button
                        type="button"
                        onClick={() => previewInvoice(l.invoicePdfUrl)}
                        className="text-blue-600 underline font-medium"
                      >
                        {l.invoiceNo || "View"}
                      </button>
                    ) : (
                      l.invoiceNo || "-"
                    )}
                  </td>

                  <td className="border px-2 py-1">
                    {new Date(l.date).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-1">{l.userId?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
