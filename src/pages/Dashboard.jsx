import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import ProductTable from "../components/ProductTable";
import AddProductModal from "../components/AddProductForm";
import { getDashboardData } from "../services/productService";
import logo from "../assets/logo.png";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getDashboardData();
      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error("LOAD DASHBOARD ERROR:", err);
    }
  };

  /* =========================
     SEARCH
  ========================= */
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(products);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        )
      );
    }
  }, [search, products]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
            {user?.role === "admin" && (
              <>
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  + Add Product
                </button>

                {/* ✅ BULK ADD BUTTON */}
                <button
                  onClick={() => navigate("/bulk-products")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Bulk Add
                </button>
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
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        {/* TABLE */}
        <ProductTable products={filtered} onRefresh={loadProducts} />
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
