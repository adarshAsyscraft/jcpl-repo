import request from "./request";

const leadsService = {
  getAll: (params) => request.get(`/lead`, { params }),
  // getById: (params,id) => request.get(`/lead/${id}`, { params }),
  getByUuid: (uuid) => request.get(`/lead/${uuid}`),
  create: (data) => request.post("/lead/add",data ,{}),
  update: (id ,data) => request.put(`/lead/${id}`, data, {}),
  delete: (id, data) => request.delete(`/goals/${id}`, data, {}),
};

export default leadsService;