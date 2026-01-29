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

  // 🔥 Opening correction fields
  const [openingQty, setOpeningQty] = useState("");
  const [openingPrice, setOpeningPrice] = useState("");

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
      setError(
        err.response?.data?.message ||
          "Opening correction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[420px] shadow">
        <h2 className="text-lg font-bold mb-2">
          Adjust Stock – {product.name}
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          Current Qty: <b>{product.currentQty}</b>
        </p>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        {/* =========================
            NORMAL ADJUSTMENT
        ========================= */}
        <form onSubmit={submitHandler} className="space-y-3">
          <select
            className="border p-2 w-full rounded"
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}
          >
            <option value="INCREASE">Increase Stock</option>
            <option value="DECREASE">Decrease Stock</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            className="border p-2 w-full rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <textarea
            placeholder="Reason (optional)"
            className="border p-2 w-full rounded"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Processing..." : "Apply Adjustment"}
          </button>
        </form>

        {/* =========================
            OPENING CORRECTION
        ========================= */}
        <div className="border-t mt-5 pt-4 space-y-2">
          <h3 className="font-semibold text-sm text-gray-700">
            Correct Opening Inventory
          </h3>

          <input
            type="number"
            min="0"
            placeholder="Correct Opening Qty"
            className="border p-2 w-full rounded"
            value={openingQty}
            onChange={(e) => setOpeningQty(e.target.value)}
          />

          <input
            type="number"
            min="0"
            placeholder="Correct Opening Price"
            className="border p-2 w-full rounded"
            value={openingPrice}
            onChange={(e) => setOpeningPrice(e.target.value)}
          />

          <button
            onClick={correctOpening}
            disabled={loading}
            className="bg-orange-600 text-white px-4 py-2 rounded w-full"
          >
            Fix Opening Inventory
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
