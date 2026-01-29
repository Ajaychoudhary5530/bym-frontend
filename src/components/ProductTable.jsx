import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import StockInModal from "./StockInModal";
import StockOutModal from "./StockOutModal";
import StockAdjustModal from "./StockAdjustModal";

export default function ProductTable({ products, onRefresh }) {
  const { user } = useContext(AuthContext);

  const [stockInProduct, setStockInProduct] = useState(null);
  const [stockOutProduct, setStockOutProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);

  // Allow admin + superadmin
  const canStockIn =
    user?.role === "admin" || user?.role === "superadmin";

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
              <th className="border px-2 py-2 w-[90px] text-center">
                Avg Price
              </th>
              <th className="border px-2 py-2 w-[100px] text-center">
                Value
              </th>
              <th className="border px-2 py-2 w-[70px] text-center">
                Status
              </th>
              <th className="border px-2 py-2 w-[150px] text-center">
                Actions
              </th>
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
              const openingQty = Number(p.openingQty || 0);
              const qtyIn = Number(p.qtyIn || 0);
              const amazonOut = Number(p.amazonOut || 0);
              const othersOut = Number(p.othersOut || 0);
              const currentQty = Number(p.currentQty || 0);
              const minStock = Number(p.minStock || 0);

              const lowStock = currentQty < minStock;

              return (
                <tr key={p._id} className={lowStock ? "bg-red-50" : ""}>
                  <td className="border px-2 py-1 truncate">{p.name}</td>
                  <td className="border px-2 py-1 truncate">
                    {p.category || "-"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {p.variant || "-"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {p.unit}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {openingQty}
                  </td>
                  <td className="border px-2 py-1 text-center">{qtyIn}</td>
                  <td className="border px-2 py-1 text-center">
                    {amazonOut}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {othersOut}
                  </td>
                  <td className="border px-2 py-1 text-center font-semibold">
                    {currentQty}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {minStock}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    ₹ {Number(p.avgPurchasePrice || 0).toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-center font-semibold">
                    ₹ {Number(p.stockValue || 0).toFixed(2)}
                  </td>

                  <td className="border px-2 py-1 text-center">
                    {lowStock ? (
                      <span className="text-red-600 font-bold">LOW</span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        OK
                      </span>
                    )}
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="border px-2 py-1">
                    <div className="flex justify-center items-center gap-1">
                      {canStockIn && (
                        <button
                          onClick={() => setStockInProduct(p)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs min-w-[42px]"
                        >
                          IN
                        </button>
                      )}

                      <button
                        onClick={() => setStockOutProduct(p)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs min-w-[42px]"
                      >
                        OUT
                      </button>

                      {canStockIn && (
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs min-w-[42px]"
                        >
                          ADJ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* STOCK IN */}
      {stockInProduct && canStockIn && (
        <StockInModal
          product={stockInProduct}
          onClose={() => setStockInProduct(null)}
          onSuccess={() => {
            setStockInProduct(null);
            onRefresh();
          }}
        />
      )}

      {/* STOCK OUT */}
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

      {/* ADJUSTMENT */}
      {adjustProduct && canStockIn && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={() => {
            setAdjustProduct(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
