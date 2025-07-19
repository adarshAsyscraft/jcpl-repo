import request from './request';

const yardService = {
    getAll: (params) => request.get(`/yards//viewAll-yard`, { params }),
    create: (data) => request.post("/yards/create-yard",  data ,{}),
    update: (id ,data) => request.put(`/yards/update-yard/${id}`, data, {}),
    delete: (id, data) => request.delete(`/yard/delete-yard/${id}`, data, {}),
    search: (query) => request.get(`/yards/searchAll-yard`, {
        params: { query }
      }),
      
};

export default yardService;