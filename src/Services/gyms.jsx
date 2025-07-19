import request from "./request";

const gymsService = {
  getAll: (params) => request.get(`/gym`, { params }),
  create: (data) => request.post("/goals",  data ,{}),
  update: (id ,data) => request.put(`/goals/${id}`, data, {}),
  delete: (id, data) => request.delete(`/goals/${id}`, data, {}),
};

export default gymsService;