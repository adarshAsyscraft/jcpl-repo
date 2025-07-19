import request from './request';

const forwarderService = {
    getAll: (params) => request.get(`/forwarders/viewAll-ForwarderShippingLine`, { params }),
    create: (data) => request.post("/forwarders/create-forwarderShippingLine",  data ,{}),
    update: (id ,data) => request.put(`/forwarders/update-forwarderShippingLine/${id}`, data, {}),
    delete: (id, data) => request.delete(`/forwarders/delete-ForwarderShippingLine/${id}`, data, {}),
    search: (query) => request.get(`/forwarders/search-ForwarderShippingLine`, {
        params: { query }
      }),
      
};

export default forwarderService;