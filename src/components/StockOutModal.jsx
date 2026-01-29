import { useState, useMemo, useEffect } from "react";
import api from "../services/api";

export default function StockOutModal({ product, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [source, setSource] = useState("AMAZON");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentQty = Number(product.currentQty ?? product.quantity ?? 0);

  /* =========================
     DEFAULT DATE = TODAY
  ========================= */
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  /* =========================
     PREVIEW CALCULATION
  ========================= */
  const preview = useMemo(() => {
    const q = Number(quantity);
    if (!q || q <= 0) return null;

    if (q > currentQty) {
      return { error: "Insufficient stock" };
    }

    return {
      newQty: currentQty - q,
    };
  }, [quantity, currentQty]);

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    const q = Number(quantity);

    if (!q || q <= 0) {
      return setError("Valid quantity is required");
    }

    if (q > currentQty) {
      return setError("Insufficient stock");
    }

    if (!date) {
      return setError("Date is required");
    }

    if (!["AMAZON", "OTHERS"].includes(source)) {
      return setError("Invalid source");
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/stock/out", {
        productId: product._id,
        quantity: q,
        date,
        source,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Stock OUT failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 shadow">
        <h2 className="text-lg font-bold mb-1">Stock OUT – {product.name}</h2>

        <p className="text-sm text-gray-600 mb-3">
          Current Stock: <b>{currentQty}</b>
        </p>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={submitHandler} className="space-y-3">
          {/* SOURCE */}
          <div>
            <label className="text-sm font-medium">Source</label>
            <select
              className="border p-2 w-full rounded mt-1"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="AMAZON">Amazon</option>
              <option value="OTHERS">Others (Flipkart / Offline / BYM)</option>
            </select>
          </div>

          {/* QUANTITY */}
          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="number"
              min="1"
              className="border p-2 w-full rounded mt-1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* DATE */}
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="border p-2 w-full rounded mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="bg-gray-50 border rounded p-3 text-sm">
              {preview.error ? (
                <p className="text-red-600">{preview.error}</p>
              ) : (
                <p>
                  New Stock Qty: <b>{preview.newQty}</b>
                </p>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-1 rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              {loading ? "Processing..." : "Confirm Stock OUT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
