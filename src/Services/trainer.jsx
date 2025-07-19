import request from "./request";

const trainersService = {
  getAll: (params) => request.get(`/trainer`, { params }),
  getAllBookings: (params) => request.get(`/trainer/bookings/book`, { params }),
  // getById: (params,id) => request.get(`/lead/${id}`, { params }),
  getByUuid: (uuid) => request.get(`/lead/${uuid}`),
  create: (data) => request.post("/lead/add",data ,{}),
  update: (id ,data) => request.put(`/lead/${id}`, data, {}),
  delete: (id, data) => request.delete(`/goals/${id}`, data, {}),
  getAllTrainerWorkoutPlan: (params) => request.get(`/trainer-workout/workout-plans`, { params }),
  getAllWorkouts: (params) => request.get(`/admin/workouts`, { params }),
};

export default trainersService;