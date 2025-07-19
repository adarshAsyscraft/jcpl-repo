import request from './request';

const containerTypeService = {
    getAll: (params) => request.get(`/containerTypes/viewAll-containerType`, { params }),
    create: (data) => request.post("/containerTypes/create-containerType",  data ,{}),
    update: (id ,data) => request.put(`/containerTypes/updateContainerType/${id}`, data, {}),
    delete: (id, data) => request.delete(`/containerTypes/deleteContainerType/${id}`, data, {}),
    search: (query) => request.get(`/containerTypes/searchContainerType`, {
        params: { query }
      }),
      
};

export default containerTypeService;