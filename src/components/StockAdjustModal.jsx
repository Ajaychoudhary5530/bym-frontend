import { useState } from "react";
import api from "../services/api";

export default function StockAdjustModal({
  product,
  onClose,
  onSuccess,
}) {
  const [quantity, setQuantity] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("INCREASE");
  const [reason, setReason] = useState("");

  const [openingQty, setOpeningQty] = useState("");
  const [openingPrice, setOpeningPrice] = useState("");

  const [minStock, setMinStock] = useState(product.minStock ?? "");
  const [minStockReason, setMinStockReason] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     NORMAL ADJUSTMENT
  ========================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) {
      setError("Valid quantity required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/stock/adjust", {
        productId: product._id,
        quantity: Number(quantity),
        adjustmentType,
        reason,
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Adjustment failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     OPENING CORRECTION
  ========================= */
  const correctOpening = async () => {
    if (openingQty === "" || openingPrice === "") {
      setError("Opening qty and price required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.put("/inventory/opening", {
        productId: product._id,
        openingQty: Number(openingQty),
        openingPrice: Number(openingPrice),
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Opening correction failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     MIN STOCK
  ========================= */
  const updateMinStock = async () => {
    if (minStock === "" || Number(minStock) < 0) {
      setError("Valid minimum stock required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.put("/inventory/adjust-min-stock", {
        productId: product._id,
        minStock: Number(minStock),
        reason: minStockReason,
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Min stock update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-[360px] p-4 text-sm">
        <h2 className="font-semibold mb-1 truncate">
          Adjust Stock – {product.name}
        </h2>

        <p className="text-xs text-gray-500 mb-2">
          Current Qty: <b>{product.currentQty}</b>
        </p>

        {error && (
          <p className="text-red-600 text-xs mb-2">{error}</p>
        )}

        {/* ===== STOCK ADJUST ===== */}
        <form onSubmit={submitHandler} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border p-1.5 rounded"
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
            >
              <option value="INCREASE">Increase</option>
              <option value="DECREASE">Decrease</option>
            </select>

            <input
              type="number"
              min="1"
              placeholder="Qty"
              className="border p-1.5 rounded"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <textarea
            rows={2}
            placeholder="Reason (optional)"
            className="border p-1.5 rounded w-full"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-indigo-600 text-white py-1.5 rounded w-full"
          >
            Apply Adjustment
          </button>
        </form>

        {/* ===== OPENING ===== */}
        <div className="border-t mt-3 pt-2 space-y-2">
          <p className="font-medium text-xs text-gray-700">
            Opening Correction
          </p>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Opening Qty"
              className="border p-1.5 rounded"
              value={openingQty}
              onChange={(e) => setOpeningQty(e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Opening Price"
              className="border p-1.5 rounded"
              value={openingPrice}
              onChange={(e) => setOpeningPrice(e.target.value)}
            />
          </div>

          <button
            onClick={correctOpening}
            disabled={loading}
            className="bg-orange-600 text-white py-1.5 rounded w-full"
          >
            Fix Opening
          </button>
        </div>

        {/* ===== MIN STOCK ===== */}
        <div className="border-t mt-3 pt-2 space-y-2">
          <p className="font-medium text-xs text-gray-700">
            Min Stock (Current: {product.minStock ?? 0})
          </p>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              className="border p-1.5 rounded"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />

            <button
              onClick={updateMinStock}
              disabled={loading}
              className="bg-yellow-600 text-white rounded"
            >
              Update
            </button>
          </div>

          <textarea
            rows={1}
            placeholder="Reason (optional)"
            className="border p-1.5 rounded w-full"
            value={minStockReason}
            onChange={(e) => setMinStockReason(e.target.value)}
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-end mt-3">
          <button
            onClick={onClose}
            className="text-xs border px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
