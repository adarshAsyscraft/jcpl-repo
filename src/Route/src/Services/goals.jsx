import request from "./request";

const goalsService = {
  getAll: (params) => request.get(`/goals`, { params }),
  create: (data) => request.post("/goals",  data ,{}),
  update: (id ,data) => request.put(`/goals/${id}`, data, {}),
  delete: (id, data) => request.delete(`/goals/${id}`, data, {}),
};

export default goalsService;