import request from './request';

const containerService = {
    getAll: (params) => request.get(`/containers/viewAll-container`, { params }),
    create: (data) => request.post("/containers/create-container",  data ,{}),
    update: (id ,data) => request.put(`/containers/update-container/${id}`, data, {}),
    delete: (id, data) => request.delete(`/containers/delete-container/${id}`, data, {}),
};

export default containerService;