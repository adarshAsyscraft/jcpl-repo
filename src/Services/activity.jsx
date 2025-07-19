import request from "./request";

const activityService = {
  getAll: (params) => request.get(`/activity`, { params }),
  create: (data) => request.post("/activity",  data ,{}),
  update: (id ,data) => request.put(`/activity/${id}`, data, {}),
  delete: (id, data) => request.delete(`/activity/${id}`, data, {}),
};

export default activityService;