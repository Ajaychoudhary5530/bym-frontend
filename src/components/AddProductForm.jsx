import { useState } from "react";
import api from "../services/api";

export default function AddProductModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    variant: "",
    openingStock: "",
    price: "",
    purchasePrice: "",
    minStock: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      if (value === "") {
        setForm({ ...form, [name]: "" });
        return;
      }
      setForm({ ...form, [name]: Math.max(0, Number(value)) });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    try {
      if (!form.name || !form.sku) {
        alert("Name and SKU are required");
        return;
      }

      await api.post("/products", {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unit: form.unit,
        variant: form.variant,

        openingStock: Number(form.openingStock || 0),
        price: Number(form.price || 0),
        purchasePrice: Number(form.purchasePrice || 0),

        minStock: Number(form.minStock || 0),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-3">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold">Add Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Product Name *</label>
              <input
                name="name"
                placeholder="Ex: Oxygen Concentrator"
                className="border p-2 w-full rounded mt-1"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* SKU */}
            <div>
              <label className="text-sm font-medium">SKU *</label>
              <input
                name="sku"
                placeholder="Ex: OXY-5LPM"
                className="border p-2 w-full rounded mt-1"
                value={form.sku}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <input
                name="category"
                placeholder="Ex: Respiratory"
                className="border p-2 w-full rounded mt-1"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            {/* Unit */}
            <div>
              <label className="text-sm font-medium">Unit</label>
              <select
                name="unit"
                className="border p-2 w-full rounded"
                value={form.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>
                <option value="Nos">Nos (Numbers)</option>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Unit">Unit</option>
                <option value="Set">Set</option>
                <option value="Pair">Pair</option>
                <option value="Box">Box</option>
              </select>
            </div>

            {/* Variant */}
            <div>
              <label className="text-sm font-medium">Variant</label>
              <input
                name="variant"
                placeholder="Ex: 5LPM"
                className="border p-2 w-full rounded mt-1"
                value={form.variant}
                onChange={handleChange}
              />
            </div>

            {/* Opening Stock */}
            <div>
              <label className="text-sm font-medium">Opening Stock</label>
              <input
                type="number"
                name="openingStock"
                min="0"
                placeholder="0"
                className="border p-2 w-full rounded mt-1"
                value={form.openingStock}
                onChange={handleChange}
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="text-sm font-medium">Selling Price</label>
              <input
                type="number"
                name="price"
                min="0"
                placeholder="0"
                className="border p-2 w-full rounded mt-1"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="text-sm font-medium">Purchase Price</label>
              <input
                type="number"
                name="purchasePrice"
                min="0"
                placeholder="0"
                className="border p-2 w-full rounded mt-1"
                value={form.purchasePrice}
                onChange={handleChange}
              />
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="text-sm font-medium">Minimum Stock</label>
              <input
                type="number"
                name="minStock"
                min="0"
                placeholder="0"
                className="border p-2 w-full rounded mt-1"
                value={form.minStock}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
