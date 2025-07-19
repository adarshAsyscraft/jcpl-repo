import request from './request';

const transporterService = {
    getAll: (params) => request.get(`/transporters/viewAll-Transporter`, { params }),
    create: (data) => request.post("/transporters/create-Transporter",  data ,{}),
    update: (id ,data) => request.put(`/transporters/update-Transporter/${id}`, data, {}),
    delete: (id, data) => request.delete(`/transporters/delete-Transporter/${id}`, data, {}),
    search: (query) => request.get(`/transporters/search-Transporter`, {
        params: { query }
      }),
      
};

export default transporterService;