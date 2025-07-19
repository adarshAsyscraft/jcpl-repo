import request from "./request";

const operationService = {
  createDestuffFcl: (data) =>
    request.post("/destuffFclContainers/create-destuffFCLContainer", data, {}),
  createDestuffLCLRequest: (data) =>
    request.post(
      "/destuffLclContainers/create-destuffingLCLContainer",
      data,
      {}
    ),
  createDestuffLCL: (data) =>
    request.post(
      "/destuffLclContainers/create-destuffingLCLContainer",
      data,
      {}
    ),
  allotmentStuffing: (data) => request.post("/allotment-stuffing", data),
  cartingLCL: (data) => request.post("/cartingLcl", data, {}),
  factoryStuffing: (data) => request.post("/factory-stuffing/create", data, {}),
  stuffingLCL: (data) => request.post("/stuffing-lcl", data, {}),
  gateIn: (data) =>
    request.post("/getInContainers/create-getInContainer", data, {}),
  gateOut: (data) =>
    request.post("/getOutContainers/create-getOutContainer", data, {}),
  sevenPointCheckList: (data) => request.post("/sevenPointChecklist", data, {}),
  socInspection: (data) => request.post("/socInspection", data, {}),
  emptyContainerInspection: (data) =>
    request.post("/emptyContainerInspection", data, {}),
  icdStuffing: (data) => request.post("/icd-stuffing/create", data, {}),
  measurment: (data) => request.post("/measurement-data", data, {}),
  dispatchData: (data) => request.post("/dispatch", data, {}),
  stuffingProceed: (data) =>
    request.post("/stuffing-lcl/stuffing-procced", data, {}),
  allotmentER: (data) => request.post("/allotment-er", data, {}),
  createDeAllotment: (data) => request.post("/de-allotment", data, {}),

  // carry forwarder
  arrivalContainer: (containerNumber, data) =>
    request.get(
      `arrivalContainers/get-by-container-number/${containerNumber}`,
      data,
      { containerNumber }
    ),
  destuffLclContainer: (containerNumber, data) =>
    request.get(
      `/destuffLclContainers/get-by-container-number/${containerNumber}/1`,
      data,
      { containerNumber }
    ),
  destuffLclRequestContainer: (containerNumber, data) =>
    request.get(
      `/destuffLclContainers/get-by-container-number/${containerNumber}/2`,
      data,
      { containerNumber }
    ),
  getOutContainerExists: (containerNumber, data) =>
    request.get(
      `/getOutContainers/get-by-container-number/${containerNumber}`,
      data,
      { containerNumber }
    ),
  destuffFCLContainer: (containerNumber, data) =>
    request.get(
      `/destuffFclContainers/get-by-container-number/${containerNumber}`,
      data,
      { containerNumber }
    ),
  getInDataFechByContainerNumber: (containerNumber, data) =>
    request.get(
      `/getInContainers/get-by-container-number/${containerNumber}`,
      data,
      { containerNumber }
    ),
  allotmentStuffingDetailsByContainerNo: (containerNumber, data) =>
    request.get(
      `/allotment-stuffing/get-container-details/${containerNumber}`,
      data,
      { containerNumber }
    ),

  // getCartingByCartingNumber: (data) =>
  //   request.post(`/cartingLcl/carting_number`, data, {}),

  getShipBillByCartingNumber: (data) =>
    request.post(`/cartingLcl/ship_bill_number`, data, {}),

  addCartingDetails: (data) =>
    request.post(`/cartingLcl/carting-details/add`, data, {}),
  getCartingDetails: (data) =>
    request.get(`/cartingLcl/carting-details/list`, {
      params: data,
    }),
  deleteCartingDetails: (id) =>
    request.get(`/cartingLcl/carting-details/${id}`),

  getFactoryStuffingDetails: (data) =>
    request.get(`/factory-stuffing/details/${data}`, data, {}),
  getStuffingLclDetails: (data) =>
    request.get(`/stuffing-lcl/getByContainerNo/${data}`, data, {}),
  getICDStuffingDetails: (containerNumber, data) =>
    request.get(`/icd-stuffing/${containerNumber}`, data, { containerNumber }),
  getAllotmentER: (containerNumber, data) =>
    request.get(`/allotment-er/details/${containerNumber}`, data, {
      containerNumber,
    }),
  updateCartingDetail: (id, data) => request.patch(`/cartingLcl/${id}`, data),
  updateCarting: (id, data) => request.patch(`/cartingLcl/${id}`, data),
  deleteCartingDetail: (id) => request.delete(`/cartingLcl/${id}`),
  updateStuffingLcl: (id) => request.out(`/stuffing-lcl/${id}`),
};

export default operationService;
