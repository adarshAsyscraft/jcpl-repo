import request from "./request";

const attendanceService = {
  getAll: (params) => request.get(`admin/attendance`, { params }),
  getAllById: (id ,params) => request.get(`admin/attendance/${id}`, { params }),
  getAllUserAttendance: (params) => request.get(`admin/get-all-attendance`, { params }),
  update: (id ,data) => request.post(`/admin/attendance/mark/${id}`, data, {}),
  delete: (id, data) => request.delete(`/users/${id}`, data, {}),
};

export default attendanceService;