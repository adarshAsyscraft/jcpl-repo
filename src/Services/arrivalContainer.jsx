// src/Services/arrivalContainer.js
import request from './request';

const arrivalContainerService = {
  create: (data) => request.post("/arrivalContainers/create-ArrivalContainer", data),
};

export default arrivalContainerService;
