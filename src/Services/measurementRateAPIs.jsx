import request from "./request";

const MeasurementRateAPIs = {
  getAll: (params) => request.get(`/measurement-rate/list`, { params }),
  create: (data) => request.post(`/measurement-rate`, data),
  delete: (id) => request.delete(`/measurement-rate/${id}`),
};

export default MeasurementRateAPIs;
