import request from "./request";

const ClientService = {
  getAll: (params) => request.get(`/client-servey/list`, { params }),
  create: (data) => request.post(`/client-servey`, data),
  update: (id, data) => request.put(`/client-servey/${id}`, data),
  delete: (id) => request.delete(`/client-servey/${id}`),
};

export default ClientService;
