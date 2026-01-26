import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StockHistory from "./pages/StockHistory";
import BulkProductUpload from "./pages/BulkProductUpload";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/history"
        element={user ? <StockHistory /> : <Navigate to="/login" />}
      />

      {/* ✅ BULK UPLOAD ROUTE (Protected) */}
      <Route
        path="/bulk-products"
        element={user ? <BulkProductUpload /> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
