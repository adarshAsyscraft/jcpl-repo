import React, {
  Fragment,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import ContainerDetailsSection from "./containerDetails";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";

const DispatchContainer = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { containerNumber } = useParams();
  const [previousPageData, setPreviousPageData] = useState({});
  const selectedOperation = location.state?.operation || "";
  const { fetchedContainer } = useSelector((state) => state.container);
  const [errors, setErrors] = useState({});
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  const yards = useSelector((state) => state.yards || {});
  const transporters = useSelector((state) => state.transporters);
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [dataByCartingNumber, setDataByCartingNumber] = useState({});
  let operationFromStorage = parseInt(localStorage.getItem("operation"), 10);

  const [formData, setFormData] = useState({
    containerNumber,
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    remarks: "",
    operation: selectedOperation,
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    wagonNo: "",
    pol: "",
    shipLine: "",
    containerCondition: "",
    anyOtherCondition: "",
    bookingNumber: "",
    yard: "",
    transporter: "",
    portOfDischarge: "",
    dispatchDate: "",
    custom: "",
    other: "",
    otherSealDescription: "",
    containerRemarks: "",
    anyOtherRemarks: "",
    shipperName: "",
    consigneeName: "",
    tainNo: "",
    truckNo: "",
    vesselName: "",
    cargo: "",
    containerStatus: "",
    fpd: "",
    refNo: "",
    hsCode: "",
  });

  // useEffect(() => {
  //   const mergedData = {
  //     containerNumber: fetchedContainer?.container_number || "",
  //     shippingLineId: fetchedContainer?.shipping_line_id || "",
  //     size: fetchedContainer?.size || "",
  //     type: fetchedContainer?.container_type || "",
  //     tareWeight: fetchedContainer?.tare_weight || "",
  //     mgWeight: fetchedContainer?.mg_weight || "",
  //     mfdDate: fetchedContainer?.mfd_date || "",
  //     cscValidity: fetchedContainer?.csc_validity || "",
  //     remarks: fetchedContainer?.remarks || "",

  //     forwarder1:
  //       previousPageData?.forwarder1 || previousPageData?.forwarder1Id || "",
  //     forwarder2:
  //       previousPageData?.forwarder2 || previousPageData?.forwarder2Id || "",
  //     bookingNumber:
  //       previousPageData?.bookingNumber ||
  //       previousPageData?.booking_no ||
  //       previousPageData?.bookingNo ||
  //       "",
  //     yard:
  //       previousPageData?.yardId ||
  //       previousPageData?.yard ||
  //       previousPageData?.yard_id ||
  //       previousPageData?.yardName ||
  //       "",
  //     transportMode: previousPageData?.transport_mode || "",
  //     loadStatus:
  //       previousPageData?.load_status ||
  //       previousPageData?.loadStatus ||
  //       "loaded",
  //     vesselName:
  //       previousPageData?.vesselViaNumber || previousPageData?.vesselByNo || "",
  //     shipperName:
  //       (previousPageData?.cargoDetails &&
  //         previousPageData?.cargoDetails[0]?.shipperName) ||
  //       "",
  //     consigneeName:
  //       (previousPageData?.cargoDetails &&
  //         previousPageData?.cargoDetails[0]?.consigneeName) ||
  //       "",
  //     cargo:
  //       (previousPageData?.cargoDetails &&
  //         previousPageData?.cargoDetails[0]?.cargo) ||
  //       "",
  //     hsCode: previousPageData?.hsCode || "",
  //     portOfDischarge:
  //       previousPageData?.dischargePortName ||
  //       previousPageData[0]?.pod ||
  //       previousPageData?.pod ||
  //       "",
  //     pol: previousPageData?.pol || previousPageData[0]?.pol || "",
  //     shipLine:
  //       previousPageData?.shipline ||
  //       previousPageData[0]?.shipping_line_seal ||
  //       "",
  //     custom:
  //       previousPageData?.custom || previousPageData[0]?.custom_seal || "",
  //     other: previousPageData?.other || "",
  //     otherSealDescription:
  //       previousPageData?.other_description ||
  //       previousPageData?.otherSealRemark ||
  //       "",
  //     anyOtherRemarks: previousPageData?.anyOtherRemark || "",
  //     containerRemarks:
  //       previousPageData?.remarks || previousPageData?.remark || "",
  //     fpd: previousPageData?.fpd || previousPageData[0]?.fpd || "",
  //     refNo: previousPageData?.ref_no || "",
  //     containerStatus: previousPageData?.containerStatus || "",
  //   };

  //   setFormData((prev) => ({
  //     ...prev,
  //     ...mergedData,
  //   }));
  // }, [fetchedContainer, previousPageData]);

  // console.log("Fetched Container::", fetchedContainer);

  useEffect(() => {
    if (!fetchedContainer) return;

    const containerData = {
      containerNumber: fetchedContainer?.container_number || "",
      shippingLineId: fetchedContainer?.shipping_line_id || "",
      size: fetchedContainer?.size || "",
      type: fetchedContainer?.container_type || "",
      tareWeight: fetchedContainer?.tare_weight || "",
      mgWeight: fetchedContainer?.mg_weight || "",
      mfdDate: fetchedContainer?.mfd_date || "",
      cscValidity: fetchedContainer?.csc_validity || "",
      remarks: fetchedContainer?.remarks || "",
    };

    setFormData((prev) => ({
      ...prev,
      ...containerData,
    }));
  }, [fetchedContainer]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name == "containerRemarks" ||
      name == "anyOtherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      container_id: fetchedContainer.id,
      shipper_name: formData.shipperName,
      forwarder1_code: formData.forwarder1,
      forwarder2_code: formData.forwarder2, // Changed from FWD003
      consignee_name: formData.consigneeName,
      booking_no: formData.bookingNumber, // Added prefix
      yard: formData.yard,
      transport_mode: formData.transportMode,
      load_status: formData.loadStatus,
      train_truck_no: formData.tainNo || formData.truckNo || null,
      wagon_no: formData.wagonNo || null,
      transporter: formData.transportMode || null,
      vessel_name_voy: formData.vesselName || null, // Structured format
      pol: formData.pol || null, // Valid port
      port_of_discharge: formData.portOfDischarge || null, // Valid port
      fpd: formData.fpd || null, // Valid port
      dispatch_date: formData.dispatchDate
        ? moment(formData.dispatchDate, "DD-MM-YYYY").format("YYYY-MM-DD")
        : null,
      ref_no: formData.refNo || null, // Added prefix
      ship_line: formData.shipLine || null,
      custom: formData.custom || null,
      other: formData.other || null,
      other_seal_description: formData.otherSealDescription || null,
      remarks: formData.containerRemarks || null,
      any_other_remarks: formData.anyOtherRemarks || null,
      hsCode: formData.hsCode || null,
    };

    try {
      const res = await operationService.dispatchData(payload);
      if (res.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED DISPATCH OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${res.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error("Dispatch failed: " + res.message);
        console.error("Backend error:", res);
      }
    } catch (error) {
      toast.error("Something went wrong while saving dispatch");
      console.error("Exception:", error);
    }
    // console.log("Payload Data::", payload);
  };

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());
  }, [dispatch, containerNumber]);

  // const getPreviousPageData = async () => {
  //   const operationFromStorage = parseInt(
  //     localStorage.getItem("operation"),
  //     10
  //   );

  //   let load_status = null;

  //   if ([8, 24, 6].includes(operationFromStorage)) {
  //     load_status = "loaded";
  //   } else if (operationFromStorage === 20) {
  //     load_status = "empty";
  //   }

  //   let res;

  //   if (load_status === "loaded") {
  //     const fetchMap = {
  //       8: operationService.getFactoryStuffingDetails,
  //       6: operationService.getICDStuffingDetails,
  //       24: operationService.getStuffingProceedDetail,
  //     };

  //     const fetchFunc = fetchMap[operationFromStorage];

  //     if (fetchFunc) {
  //       res = await fetchFunc(containerNumber);
  //       setPreviousPageData(res.data);
  //       console.log("response1212::", res);
  //       return;
  //     }
  //   } else if (load_status === "empty") {
  //     res = await operationService.getAllotmentER(containerNumber);
  //     setPreviousPageData(res.data);
  //   }
  // };

  const fetchCartingDetails = async () => {
    try {
      const queryParams = {
        containerNumber: formData.containerNumber,
      };

      const res = await operationService.getCartingDetails(queryParams);
      if (res.success) {
        console.log("Result::", res.data[0]);
        setDataByCartingNumber(res.data[0]);
      } else {
        toast.error(res.message || "Failed to fetch carting details");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Something went wrong while fetching details.");
    }
  };

  useEffect(() => {
    if (operationFromStorage == 24) {
      fetchCartingDetails();
    }
  }, [fetchedContainer.container_number]);

  const getPreviousPageData = async () => {
    console.log("Last OP::", operationFromStorage);

    let load_status = null;

    if ([8, 24, 6].includes(operationFromStorage)) {
      load_status = "loaded";
    } else if (operationFromStorage == 20) {
      load_status = "empty";
    }

    let res;

    if (load_status == "loaded") {
      const fetchMap = {
        8: operationService.getFactoryStuffingDetails,
        6: operationService.getICDStuffingDetails,
        24: operationService.getStuffingLCLProceedDetail,
      };

      const fetchFunc = fetchMap[operationFromStorage];

      if (fetchFunc) {
        if (operationFromStorage == 24) {
          res = await fetchFunc(fetchedContainer.id);
        } else {
          res = await fetchFunc(containerNumber);
        }
      }
    } else if (load_status == "empty") {
      res = await operationService.getAllotmentER(containerNumber);
    }

    if (res?.data) {
      if (Array.isArray(res.data)) {
        setPreviousPageData(res.data[0] || {});
      } else {
        setPreviousPageData(res.data);
      }
    } else {
      setPreviousPageData({});
    }
  };

  useEffect(() => {
    getPreviousPageData();
  }, [containerNumber]);

  useEffect(() => {
    if (!previousPageData || Object.keys(previousPageData).length === 0) return;

    const previousData = {
      forwarder1:
        previousPageData?.forwarder1 || previousPageData?.forwarder1Id || "",
      forwarder2:
        previousPageData?.forwarder2 || previousPageData?.forwarder2Id || "",
      bookingNumber:
        previousPageData?.bookingNumber ||
        previousPageData?.booking_no ||
        previousPageData?.bookingNo ||
        "",
      yard:
        previousPageData?.yardId ||
        previousPageData?.yard ||
        previousPageData?.yard_id ||
        previousPageData?.yardName ||
        "",
      transportMode: previousPageData?.transport_mode || "",
      loadStatus:
        previousPageData?.load_status ||
        previousPageData?.loadStatus ||
        "loaded",
      vesselName:
        previousPageData?.vesselViaNumber || previousPageData?.vesselByNo || "",
      shipperName:
        previousPageData?.cargoDetails?.[0]?.shipperName ||
        dataByCartingNumber?.shipper ||
        "",
      consigneeName:
        previousPageData?.cargoDetails?.[0]?.consigneeName ||
        dataByCartingNumber?.consignee ||
        "",
      cargo:
        previousPageData?.cargoDetails?.[0]?.cargo ||
        dataByCartingNumber?.cargo ||
        "",
      hsCode: previousPageData?.hsCode || "",
      portOfDischarge:
        previousPageData?.dischargePortName || previousPageData?.pod || "",
      pol: previousPageData?.pol || "",
      shipLine:
        previousPageData?.shipline ||
        previousPageData?.shipping_line_seal ||
        "",
      custom: previousPageData?.custom || previousPageData?.custom_seal || "",
      other: previousPageData?.other || "",
      otherSealDescription:
        previousPageData?.other_description ||
        previousPageData?.otherSealRemark ||
        "",
      anyOtherRemarks: previousPageData?.anyOtherRemark || "",
      containerRemarks:
        previousPageData?.remarks || previousPageData?.remark || "",
      fpd: previousPageData?.fpd || "",
      refNo: previousPageData?.ref_no || "",
      containerStatus: previousPageData?.containerStatus || "",
    };

    setFormData((prev) => ({
      ...prev,
      ...previousData,
    }));
  }, [previousPageData]);

  console.log("PreviousPageData ::", previousPageData);

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Allow only DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY using the same separator
    const isValidFormat =
      /^(0[1-9]|[12][0-9]|3[01])([-/.])(?:0[1-9]|1[0-2])\2\d{4}$/.test(value);

    // Determine correct format based on separator
    const matched = value.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
    const separator = matched?.[2];
    const formatMap = {
      "-": "DD-MM-YYYY",
      "/": "DD/MM/YYYY",
      ".": "DD.MM.YYYY",
    };
    const inputDate = moment(value, formatMap[separator], true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (inputDate.isAfter(current)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be more than 3 days in the past",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Dispatch Container"
        parent="Apps"
        title="Dispatch Container"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />

              <h5 className="mb-3 mt-4">Client Details</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Shipper Name</label>
                  <input
                    name="shipperName"
                    className="form-control"
                    placeholder="Shipping Name"
                    onChange={handleChange}
                    value={formData.shipperName}
                  />
                </Col>
                <Col md="6">
                  <label>Consignee Name</label>
                  <input
                    name="consigneeName"
                    className="form-control"
                    placeholder="Consignee Name"
                    onChange={handleChange}
                    value={formData.consigneeName}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Forwarder1 Code Name</label>
                  <select
                    name="forwarder1"
                    className="form-select form-select-sm"
                    onChange={handleChange}
                    value={formData.forwarder1}
                  >
                    <option value="">Select Forwarder Code 1</option>
                    {forwarders &&
                      forwarders
                        .filter((res) => res.category == "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                  </select>
                </Col>
                <Col md="6">
                  <label className="form-label">Forwarder Code 2 Name</label>
                  <select
                    name="forwarder2"
                    className="form-select form-select-sm"
                    onChange={handleChange}
                    value={formData.forwarder2}
                  >
                    <option value="">Select Forwarder Code 2</option>
                    {forwarders &&
                      forwarders
                        .filter((res) => res.category == "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                  </select>
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Booking Number/ Yard</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Booking Number</label>
                  <input
                    name="bookingNumber"
                    className="form-control"
                    placeholder="Booking Number"
                    onChange={handleChange}
                    value={formData.bookingNumber}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Yard</label>
                  <select
                    name="yard"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.yard}
                  >
                    <option value="">Select Yard</option>
                    {yards &&
                      yards.data &&
                      yards.data.map((res) => {
                        return (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        );
                      })}
                  </select>
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Transport Detail</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Transport Mode</label>
                  <select
                    name="transportMode"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.transportMode}
                  >
                    <option value="">Select Transporter Mode</option>
                    <option value="rail">Rail</option>
                    <option value="road">Road</option>
                  </select>
                </Col>
                <Col md="6">
                  <label className="form-label">Load Status</label>
                  <select
                    name="loadStatus"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.loadStatus}
                  >
                    <option value="">Load Status</option>
                    <option value="empty">Empty</option>
                    <option value="loaded">Load</option>
                  </select>
                </Col>
              </Row>

              {/* Common Fields */}
              <Row className="mb-3">
                {formData.transportMode === "road" && (
                  <>
                    <Col md="6">
                      <label className="form-label">Transporter</label>
                      <select
                        name="transporter"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.transporter}
                      >
                        <option value="">Select Transporter</option>
                        {transporters.data &&
                          transporters.data.map((res) => {
                            return (
                              <option key={res.id} value={res.id}>
                                {res.name}
                              </option>
                            );
                          })}
                      </select>
                    </Col>
                    <Col md="6">
                      <label className="form-label">Truck No</label>
                      <input
                        name="truckNo"
                        className="form-control"
                        placeholder="truck No"
                        onChange={handleChange}
                        value={formData.truckNo}
                      />
                    </Col>
                  </>
                )}
                {formData.transportMode === "rail" && (
                  <>
                    <Col md="6">
                      <label className="form-label">Wagon No</label>
                      <input
                        name="wagonNo"
                        className="form-control"
                        placeholder="Wagon No"
                        onChange={handleChange}
                        value={formData.wagonNo}
                      />
                    </Col>
                    <Col md="6">
                      <label className="form-label">Train No</label>
                      <input
                        name="tainNo"
                        className="form-control"
                        placeholder="tain No"
                        onChange={handleChange}
                        value={formData.tainNo}
                      />
                    </Col>
                  </>
                )}
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>Vessel Name</label>
                  <input
                    name="vesselName"
                    className="form-control"
                    placeholder="Vessel Name"
                    onChange={handleChange}
                    value={formData.vesselName}
                  />
                </Col>
                <Col md="6">
                  <label>Cargo</label>
                  <input
                    name="cargo"
                    className="form-control"
                    placeholder="Cargo"
                    onChange={handleChange}
                    value={formData.cargo}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">POL</label>
                  <input
                    name="pol"
                    className="form-control"
                    placeholder="POL"
                    onChange={handleChange}
                    value={formData.pol}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Port of Discharge</label>
                  <input
                    name="portOfDischarge"
                    className="form-control"
                    placeholder="Port Of Discharge"
                    onChange={handleChange}
                    value={formData.portOfDischarge}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">FPD</label>
                  <input
                    name="fpd"
                    type="text"
                    placeholder="FPD"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.fpd}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Dispatch Date</label>
                  <input
                    name="dispatchDate"
                    type="text"
                    placeholder="DD-MM-YYYY"
                    className={`form-control ${
                      errors.dispatchDate ? "is-invalid" : ""
                    }`}
                    onChange={handleDateChange}
                    value={formData.dispatchDate}
                  />
                  {errors.dispatchDate && (
                    <div className="invalid-feedback">
                      {errors.dispatchDate}
                    </div>
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Ref No</label>
                  <input
                    name="refNo"
                    type="text"
                    placeholder="Ref No."
                    className="form-control"
                    onChange={handleChange}
                    value={formData.refNo}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">HS Code</label>
                  <input
                    name="hsCode"
                    type="text"
                    placeholder="HS Code"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.hsCode}
                  />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Seal Detail</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Ship Line</label>
                  <input
                    name="shipLine"
                    type="text"
                    className="form-control"
                    placeholder="ShipLine"
                    onChange={handleChange}
                    value={formData.shipLine}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Custom</label>
                  <input
                    name="custom"
                    type="text"
                    className="form-control"
                    placeholder="Custom"
                    onChange={handleChange}
                    value={formData.custom}
                  />
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <label className="form-label">Other</label>
                  <input
                    name="other"
                    type="text"
                    className="form-control"
                    placeholder="Other"
                    onChange={handleChange}
                    value={formData.other}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Other Seal Description</label>
                  <input
                    name="otherSealDescription"
                    type="text"
                    className="form-control"
                    placeholder="Other Seal Description"
                    onChange={handleChange}
                    value={formData.otherSealDescription}
                  />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Container Condition</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Container Status</label>
                  <select
                    name="containerStatus"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.containerStatus}
                  >
                    <option value="">Select Status</option>
                    <option value="Sound">Sound</option>
                    <option value="Damage">Damage</option>
                  </select>
                </Col>
                <Col md="6">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="containerRemarks"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.containerRemarks}
                    placeholder="Remarks"
                  ></textarea>
                </Col>
                <Col md="6">
                  <label className="form-label">Any Other Remarks</label>
                  <textarea
                    name="anyOtherRemarks"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.anyOtherRemarks}
                    placeholder="Any Other Remarks"
                  ></textarea>
                </Col>
              </Row>

              <div className="text-center">
                <button className="btn btn-primary w-100" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default DispatchContainer;
