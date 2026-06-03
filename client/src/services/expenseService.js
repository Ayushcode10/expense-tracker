import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export const expenseService = {
  getAll: (filters = {}) => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return api.get("/api/expenses", { params });
  },

  create: (data) => api.post("/api/expenses", data),

  update: (id, data) => api.put(`/api/expenses/${id}`, data),

  remove: (id) => api.delete(`/api/expenses/${id}`),

  getSummary: () => api.get("/api/expenses/summary"),
};