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
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto border rounded">
        <table className="min-w-full bg-white text-xs table-fixed">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="border px-2 py-2 w-[220px] text-left">Item</th>
              <th className="border px-2 py-2 w-[110px] text-left">Category</th>
              <th className="border px-2 py-2 w-[80px] text-center">Variant</th>
              <th className="border px-2 py-2 w-[60px] text-center">UOM</th>
              <th className="border px-2 py-2 w-[70px] text-center">Opening</th>
              <th className="border px-2 py-2 w-[70px] text-center">Current</th>
              <th className="border px-2 py-2 w-[80px] text-center">Min Stock</th>
              <th className="border px-2 py-2 w-[90px] text-center">Avg Price</th>
              <th className="border px-2 py-2 w-[100px] text-center">Value</th>
              <th className="border px-2 py-2 w-[70px] text-center">Status</th>
              <th className="border px-2 py-2 w-[110px] text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {products.map((p) => {
              const currentQty = Number(p.quantity || 0);
              const minStock = Number(p.minStock || 0);
              const lowStock = currentQty < minStock;

              return (
                <tr key={p._id}>
                  <td className="border px-2 py-1 truncate">{p.name}</td>
                  <td className="border px-2 py-1">{p.category}</td>
                  <td className="border px-2 py-1 text-center">
                    {p.variant || "NA"}
                  </td>
                  <td className="border px-2 py-1 text-center">{p.unit}</td>

                  <td className="border px-2 py-1 text-center">
                    {p.openingStock}
                  </td>

                  <td className="border px-2 py-1 text-center font-semibold">
                    {currentQty}
                  </td>

                  <td className="border px-2 py-1 text-center">{minStock}</td>

                  <td className="border px-2 py-1 text-center">
                    ₹ {Number(p.avgPurchasePrice || 0).toFixed(2)}
                  </td>

                  <td className="border px-2 py-1 text-center font-semibold">
                    ₹ {Number(p.totalValue || 0).toFixed(2)}
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
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        IN
                      </button>
                    )}
                    <button
                      onClick={() => setStockOutProduct(p)}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
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
