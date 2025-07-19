import request from './request';

const containerService = {
    getAll: (params) => request.get(`/containers/viewAll-container`, { params }),
    create: (data) => request.post("/containers/create-container",  data ,{}),
    update: (id ,data) => request.put(`/containers/update-container/${id}`, data, {}),
    delete: (id, data) => request.delete(`/containers/delete-container/${id}`, data, {}),
    getByContainerNumber: (containerNumber, data) => request.get(`/containers/view-container/${containerNumber}`, data, {containerNumber}),
    checkValidConatiner :(containerNumber,data) => request.get(`/containers/check-container/${containerNumber}`,data,{containerNumber}),
    prefillData :(containerNumber,data) => request.get(`/expectedContainers/get-by-container-number/${containerNumber}`,data,{containerNumber}),
    arrivalContainerExist :(containerNumber,data) => request.get(`arrivalContainers/get-by-container-number/${containerNumber}`,data,{containerNumber}),
    destuffRequestContainer :(containerNumber,type,data) => request.get(`destuffLclContainers/get-by-container-number/${containerNumber}/${type}`,data,{containerNumber}),
    destuffFCLExist :(containerNumber,data) => request.get(`destuffFclContainers/get-by-container-number/${containerNumber}`,data,{containerNumber}),

};

export default containerService;