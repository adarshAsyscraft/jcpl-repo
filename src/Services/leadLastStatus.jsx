import request from "./request";

const leadLastStatusService = {
  getAll: (params) => request.get(`/gym`, { params }),
  getByLeadId: (id) => request.get(`/lead/last_status/leadId/${id}`),
  create: (data) => request.post("/goals",  data ,{}),
  update: (id ,data) => request.put(`/goals/${id}`, data, {}),
  delete: (id, data) => request.delete(`/goals/${id}`, data, {}),
};

export default leadLastStatusService;