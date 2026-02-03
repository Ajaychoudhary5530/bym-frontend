import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import ProductTable from "../components/ProductTable";
import AddProductModal from "../components/AddProductForm";
import api from "../services/api";
import logo from "../assets/logo.png";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 🔥 FILTER: ALL | LOW | OK | TOP
  const [statusFilter, setStatusFilter] = useState("ALL");

  const LIMIT = 20;

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    loadProducts();
  }, [page, search, statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const isTopSelling = statusFilter === "TOP";
      const isFiltered = statusFilter !== "ALL" && !isTopSelling;

      const res = await api.get("/products/with-stock", {
        params: {
          page: isTopSelling || isFiltered ? 1 : page,
          limit: isTopSelling ? 50 : isFiltered ? 10000 : LIMIT,
          search,
          topSelling: isTopSelling ? 1 : 0,
        },
      });

      const normalized = res.data.data.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        variant: p.variant,

        openingQty: Number(p.openingQty ?? 0),
        currentQty: Number(p.currentQty ?? 0),

        qtyIn: Number(p.qtyIn ?? 0),
        amazonOut: Number(p.amazonOut ?? 0),
        othersOut: Number(p.othersOut ?? 0),

        minStock: Number(p.minStock ?? 0),
        avgPurchasePrice: Number(p.avgPurchasePrice ?? 0),
        stockValue: Number(p.stockValue ?? 0),
      }));

      setProducts(normalized);

      if (!isTopSelling && !isFiltered) {
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error("LOAD DASHBOARD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  /* =========================
     INVENTORY FIRST + FILTER
  ========================= */
  const inventorySorted = [...products].sort((a, b) => {
    if (a.currentQty > 0 && b.currentQty === 0) return -1;
    if (a.currentQty === 0 && b.currentQty > 0) return 1;
    return 0;
  });

  const displayProducts = inventorySorted.filter((p) => {
    const currentQty = Number(p.currentQty ?? 0);
    const minStock = Number(p.minStock ?? 0);

    if (statusFilter === "LOW") return currentQty <= minStock;
    if (statusFilter === "OK") return currentQty > minStock;
    return true; // ALL & TOP
  });

  /* =========================
     EXPORT DASHBOARD CSV
  ========================= */
  const exportDashboardCSV = async () => {
    try {
      setExporting(true);

      const res = await api.get("/dashboard/export", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "dashboard-export.csv";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("EXPORT DASHBOARD ERROR:", err);
      alert(err.response?.data?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded shadow">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10" />
            <div>
              <h1 className="text-xl font-bold">BYM – Inventory Dashboard</h1>
              <p className="text-sm text-gray-600">
                {user?.email} ({user?.role})
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportDashboardCSV}
              disabled={exporting}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {exporting ? "Exporting..." : "Export Excel"}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  + Add Product
                </button>

                {user?.role === "superadmin" && (
                  <button
                    onClick={() => navigate("/bulk-products")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Bulk Add
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => navigate("/history")}
              className="bg-gray-800 text-white px-4 py-2 rounded"
            >
              Stock History
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={handleSearchChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* FILTER */}
        <div className="mb-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="ALL">All Products</option>
            <option value="LOW">Low Stock</option>
            <option value="OK">OK Stock</option>
            <option value="TOP">Top 50 Selling</option>
          </select>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center py-6">Loading...</p>
        ) : (
          <ProductTable products={displayProducts} onRefresh={loadProducts} />
        )}

        {/* PAGINATION */}
        {statusFilter === "ALL" && (
          <div className="flex justify-center gap-3 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
