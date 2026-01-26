import { useState, useMemo, useEffect } from "react";
import api from "../services/api";

export default function StockInModal({ product, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");

  // Stock Type + Return details
  const [stockType, setStockType] = useState("NEW"); // NEW | RETURN
  const [condition, setCondition] = useState("GOOD"); // GOOD | DAMAGED
  const [remarks, setRemarks] = useState("");

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // restore last invoice (OPTION A)
  useEffect(() => {
    const savedPdf = sessionStorage.getItem("lastInvoicePdfUrl");
    const savedNo = sessionStorage.getItem("lastInvoiceNo");
    if (savedPdf) setInvoicePdfUrl(savedPdf);
    if (savedNo) setInvoiceNo(savedNo);
  }, []);

  const currentQty = Number(product.currentQty ?? product.quantity ?? 0);
  const currentAvgPrice = Number(product.purchasePrice ?? 0);

  const preview = useMemo(() => {
    const q = Number(quantity);

    // If Return Product -> avg price should not change
    if (stockType === "RETURN") {
      if (q > 0) {
        return {
          newQty: currentQty + q,
          newAvg: Number(currentAvgPrice.toFixed(2)),
        };
      }
      return null;
    }

    // Normal New Stock -> avg price updates
    const p = Number(purchasePrice);
    if (q > 0 && p >= 0) {
      const newQty = currentQty + q;
      const newAvg = (currentQty * currentAvgPrice + q * p) / newQty;
      return { newQty, newAvg: Number(newAvg.toFixed(2)) };
    }

    return null;
  }, [quantity, purchasePrice, currentQty, currentAvgPrice, stockType]);

  const uploadInvoice = async (e) => {
    e.preventDefault(); // 🔥 stop form submit
    if (!invoiceFile) return;

    const formData = new FormData();
    formData.append("invoice", invoiceFile);

    try {
      setUploading(true);
      setError("");

      const res = await api.post("/stock/upload-invoice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setInvoicePdfUrl(res.data.pdfUrl);
      sessionStorage.setItem("lastInvoicePdfUrl", res.data.pdfUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Invoice upload failed");
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (e) => {
    e.preventDefault(); // 🔥 stop form submit
    if (!invoicePdfUrl) return;
    window.open(
      `http://localhost:5000${invoicePdfUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!quantity || Number(quantity) <= 0)
      return setError("Valid quantity is required");

    // Invoice No + Purchase Price required ONLY for New Stock
    if (stockType === "NEW") {
      if (!invoiceNo.trim()) return setError("Invoice number is required");

      if (purchasePrice === "" || Number(purchasePrice) < 0)
        return setError("Valid purchase price is required");

      // PDF upload is OPTIONAL - no validation needed
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/stock/in", {
        productId: product._id,
        quantity: Number(quantity),

        // For Return Product: invoiceNo + purchasePrice + invoicePdfUrl optional
        invoiceNo: stockType === "RETURN" ? "" : invoiceNo.trim(),
        purchasePrice: stockType === "RETURN" ? 0 : Number(purchasePrice),

        // PDF is optional for NEW and hidden for RETURN
        invoicePdfUrl: stockType === "RETURN" ? "" : invoicePdfUrl || "",

        // Return stock info
        stockType, // NEW | RETURN
        condition: stockType === "RETURN" ? condition : "",
        remarks: stockType === "RETURN" ? remarks.trim() : "",
      });

      // Save last invoice no only when NEW stock
      if (stockType === "NEW") {
        sessionStorage.setItem("lastInvoiceNo", invoiceNo.trim());
      }

      onSuccess(); // navigate ONLY here
    } catch (err) {
      setError(err.response?.data?.message || "Stock IN failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[440px] shadow">
        <h2 className="text-lg font-bold mb-1">Stock IN – {product.name}</h2>

        <p className="text-sm text-gray-600 mb-3">
          Current Stock: <b>{currentQty}</b> | Avg Price:{" "}
          <b>₹ {currentAvgPrice}</b>
        </p>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={submitHandler} className="space-y-3">
          {/* STOCK TYPE */}
          <select
            className="border p-2 w-full rounded"
            value={stockType}
            onChange={(e) => {
              const val = e.target.value;
              setStockType(val);

              // If switching to RETURN, reset invoice + price (optional)
              if (val === "RETURN") {
                setInvoiceNo("");
                setPurchasePrice("");
                setInvoiceFile(null);
                setInvoicePdfUrl("");
              }
            }}
          >
            <option value="NEW">New Stock</option>
            <option value="RETURN">Return Product</option>
          </select>

          {/* RETURN DETAILS */}
          {stockType === "RETURN" && (
            <div className="space-y-2 border rounded p-3 bg-gray-50">
              <select
                className="border p-2 w-full rounded"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="GOOD">Condition: Good</option>
                <option value="DAMAGED">Condition: Damaged</option>
              </select>

              <textarea
                placeholder="Remarks (optional)"
                className="border p-2 w-full rounded"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          )}

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            className="border p-2 w-full rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {/* Invoice No - optional for RETURN */}
          <input
            type="text"
            placeholder={
              stockType === "RETURN"
                ? "Invoice No (optional for Return)"
                : "Invoice No"
            }
            className="border p-2 w-full rounded"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />

          {/* Purchase Price - optional/disabled for RETURN */}
          <input
            type="number"
            min="0"
            placeholder={
              stockType === "RETURN"
                ? "Purchase Price (optional for Return)"
                : "Purchase Price (per unit)"
            }
            className={`border p-2 w-full rounded ${
              stockType === "RETURN" ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            value={purchasePrice}
            disabled={stockType === "RETURN"}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />

          {/* INVOICE PDF - OPTIONAL for NEW stock */}
          {stockType === "NEW" && (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Invoice PDF <span className="text-gray-500">(Optional)</span>
              </p>

              <input
                type="file"
                accept="application/pdf"
                className="border p-2 w-full rounded"
                onChange={(e) => {
                  setInvoiceFile(e.target.files[0]);
                  setInvoicePdfUrl("");
                }}
              />

              {invoiceFile && !invoicePdfUrl && (
                <button
                  type="button"
                  onClick={uploadInvoice}
                  disabled={uploading}
                  className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  {uploading ? "Uploading..." : "Upload Invoice"}
                </button>
              )}

              {invoicePdfUrl && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={openPreview}
                    className="bg-gray-800 text-white px-3 py-1 rounded"
                  >
                    Preview Invoice
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setInvoicePdfUrl("");
                      setInvoiceFile(null);
                      sessionStorage.removeItem("lastInvoicePdfUrl");
                    }}
                    className="border px-3 py-1 rounded"
                  >
                    Clear Invoice
                  </button>
                </div>
              )}
            </div>
          )}

          {preview && (
            <div className="bg-gray-50 border rounded p-3 text-sm">
              <p>
                New Stock Qty: <b>{preview.newQty}</b>
              </p>
              <p>
                New Avg Price: <b>₹ {preview.newAvg}</b>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-1 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              {loading ? "Processing..." : "Confirm Stock IN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
