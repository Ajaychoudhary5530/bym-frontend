import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import StockInModal from "./StockInModal";
import StockOutModal from "./StockOutModal";

export default function ProductTable({ products, onRefresh }) {
  const { user } = useContext(AuthContext);

  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockOutProduct, setStockOutProduct] = useState(null);

  return (
    <>
      {/* ✅ fixed height scroll + sticky header */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto border rounded">
        <table className="min-w-full bg-white text-xs table-fixed">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-2 py-2 w-[220px] text-left">Item</th>
              <th className="border px-2 py-2 w-[110px] text-left">Category</th>
              <th className="border px-2 py-2 w-[80px] text-center">Variant</th>
              <th className="border px-2 py-2 w-[60px] text-center">UOM</th>
              <th className="border px-2 py-2 w-[70px] text-center">Opening</th>
              <th className="border px-2 py-2 w-[55px] text-center">IN</th>
              <th className="border px-2 py-2 w-[85px] text-center">
                Amazon OUT
              </th>
              <th className="border px-2 py-2 w-[85px] text-center">
                Others OUT
              </th>
              <th className="border px-2 py-2 w-[70px] text-center">Current</th>
              <th className="border px-2 py-2 w-[80px] text-center">
                Min Stock
              </th>
              <th className="border px-2 py-2 w-[90px] text-center">Avg Price</th>
              <th className="border px-2 py-2 w-[100px] text-center">Value</th>
              <th className="border px-2 py-2 w-[70px] text-center">Status</th>
              <th className="border px-2 py-2 w-[110px] text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="14" className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {products.map((p) => {
              const lowStock = Number(p.currentQty) < Number(p.minStock);

              return (
                <tr key={p._id} className={lowStock ? "bg-red-50" : ""}>
                  <td className="border px-2 py-1 truncate" title={p.name}>
                    {p.name}
                  </td>

                  <td className="border px-2 py-1 truncate" title={p.category}>
                    {p.category || "-"}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {p.variant || "-"}
                  </td>

                  <td className="border px-2 py-1 text-center">{p.unit}</td>

                  <td className="border px-2 py-1 text-center">
                    {p.openingQty || 0}
                  </td>

                  <td className="border px-2 py-1 text-center">{p.qtyIn}</td>

                  <td className="border px-2 py-1 text-center">
                    {p.amazonOut}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {p.othersOut}
                  </td>

                  <td className="border px-2 py-1 text-center font-semibold">
                    {p.currentQty}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {p.minStock || 0}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    ₹ {p.avgPurchasePrice || 0}
                  </td>

                  <td className="border px-2 py-1 text-center font-semibold">
                    ₹ {(p.stockValue || 0).toFixed(2)}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {lowStock ? (
                      <span className="text-red-600 font-bold">LOW</span>
                    ) : (
                      <span className="text-green-600 font-semibold">OK</span>
                    )}
                  </td>

                  <td className="border px-2 py-1 text-center space-x-1">
                    {user?.role === "admin" && (
                      <button
                        onClick={() => setStockInProduct(p)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                      >
                        IN
                      </button>
                    )}

                    <button
                      onClick={() => setStockOutProduct(p)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                    >
                      OUT
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* STOCK IN MODAL (ADMIN ONLY) */}
      {stockInProduct && user?.role === "admin" && (
        <StockInModal
          product={stockInProduct}
          onClose={() => setStockInProduct(null)}
          onSuccess={() => {
            setStockInProduct(null);
            onRefresh();
          }}
        />
      )}

      {/* STOCK OUT MODAL (ALL USERS) */}
      {stockOutProduct && (
        <StockOutModal
          product={stockOutProduct}
          onClose={() => setStockOutProduct(null)}
          onSuccess={() => {
            setStockOutProduct(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
