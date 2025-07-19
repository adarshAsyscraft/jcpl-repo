import request from "./request";

const packagesService = {
  getAll: (params) => request.get(`/admin/packages/get`, { params }),
  getBuyPackage: (params) => request.get(`/admin/packages/get-buy-packages`, { params }),
  getMembershipData: (params) => request.get(`/user/package/get-membership-data`, { params }),
  create: (data) => request.post("/admin/packages/create",  data ,{}),
  getById: (id ,params) => request.get(`/admin/attendance/${id}`, { params }),
  update: (id ,data) => request.put(`/admin/packages/${id}`, data, {}),
  delete: (id, data) => request.delete(`/admin/packages/${id}`, data, {}),
};

export default packagesService;