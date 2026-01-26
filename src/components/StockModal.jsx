import { useState } from "react";
import api from "../services/api";

export default function StockModal({ product, mode, onClose, onSuccess }) {
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = mode === "IN" ? "/stock/in" : "/stock/out";

      await api.post(url, {
        productId: product._id,
        quantity: Number(qty)
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-lg font-bold mb-3">
          {mode === "IN" ? "Stock IN" : "Stock OUT"} – {product.name}
        </h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="number"
            className="border w-full p-2 mb-3"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-1 rounded"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
