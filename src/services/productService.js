import api from "./api";

/* =========================
   DASHBOARD DATA
========================= */
export const getDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};
