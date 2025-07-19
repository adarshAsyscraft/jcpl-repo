import request from "./request";

const transactionsService = {
  getAll: (params) => request.get(`/admin/revenue/get-transactions`, { params }),
  getRevenue: (params) => request.get(`/admin/revenue/get-revenue`, { params }),
  create: (data) => request.post("/activity",  data ,{}),
  update: (id ,data) => request.put(`/activity/${id}`, data, {}),
  delete: (id, data) => request.delete(`/activity/${id}`, data, {}),
};

export default transactionsService;