import request from "./request";

const usersService = {
  getAllUsers: (params) => request.get("/users", { params }),
  // getAll: (params) => request.get("/admin/user-details", { params }),
  // getAllUsersForMembermangement: (params) => request.get("/users/for-usermanagement", { params }),
  // create: (data) => request.post("/users/register", data, {}),
  // delete: (id, data) => request.delete(`/users/${id}`, data, {}),
  // sendOTP: (data) => request.post("/users/send-otp", data, {}),
  // createTrainer: (data) => request.post("/admin/user/create", data, {}),
};

export default usersService;
