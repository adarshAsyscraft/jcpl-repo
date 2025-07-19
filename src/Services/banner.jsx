import request from "./request";

const bannersService = {
  getAll: (params) => request.get("/admin/banners", { params }),
  create: (data) => request.post("/admin/banners",  data ,{}),
  delete: (id,data) => request.delete(`/admin/banners/${id}`,  data ,{}),
};

export default bannersService;
