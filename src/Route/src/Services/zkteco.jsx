import request from "./request";

const zktecoService = {
  getAllDevice: (params) => request.get(`/zkteco/device`, { params }),
  getAllUsers: (params) => request.get(`/zkteco`, { params }),
  getAllTransactions: (params) => request.get(`/zkteco/all_transactions`, { params }),
  getPanelDetail: (params) => request.get(`/zkteco/device/get_detail`, { params }),
  create: (data) => request.post("/activity",  data ,{}),
  update: (id ,data) => request.put(`/activity/${id}`, data, {}),
  delete: (id, data) => request.delete(`/activity/${id}`, data, {}),
  
  // area
  getAllArea: (params) => request.get(`/zkteco/area`, { params }),
  createArea: (data) => request.post("/zkteco/area",  data ,{}),


};

export default zktecoService;