import React, { Fragment, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import ContainerDetailsSection from "./containerDetails";
import { toast } from "react-toastify";
import operationService from "../../Services/operation";

const AllotmentER = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { containerNumber } = useParams();
  const selectedOperation = location.state?.operation || "";
  const [formList, setFormList] = useState([]);
  const { fetchedContainer } = useSelector((state) => state.container);
  const [formErrors, setFormErrors] = useState({});
  const [previousData, setPreviousData] = useState(null);
  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const {
    data = [],
    loading: yardsLoading,
    error: yardsError,
    payload,
  } = useSelector((state) => state.yards || {});
  const { icds, loading } = useSelector((state) => state.icd);
  const transportersState = useSelector((state) => state.transporters);
  const transporters = transportersState?.data || [];
  const transportersLoading = transportersState?.loading;
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const yardsState = useSelector((state) => state.yards || {});
  const yards = yardsState?.data || [];

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

    allotmentDate: "",
    transportMode: "",
    yardName: "",
    getOutFor: "",
    destinationPlace: "",
    transporter: "",
    loadStatus: "",
    refNumber: "",
    portPartyName: "",
    outDate: "",
    outTime: "",
    truckNumber: "",
    pol: "",
    status: "",
    mainRemark: "",
    containerNo: "",
    containerRemark: "",
  });

  const addForm = () => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        containerNumber: "",
        remarks: "",
      },
    ]);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name == "mainRemark" || e.target.type == "text") {
      value = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (index, field, value) => {
    setFormList((prevForms) =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      )
    );
  };

  const cancelForm = (index) => {
    setFormList((prevForms) => prevForms.filter((_, i) => i !== index));
  };

  const getInputType = (field) => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes("date")) return "date";
    if (
      lowerField.includes("number") ||
      lowerField.includes("weight") ||
      lowerField.includes("qty") ||
      lowerField.includes("cbm")
    )
      return "number";
    return "text";
  };

  const getpreviousData = async () => {
    const lastOp = localStorage.getItem("operation");
    let result;
    if (lastOp == "2") {
      result = await operationService.arrivalContainer(containerNumber);
    }
    if (lastOp == "3") {
      result = await operationService.destuffFCLContainer(containerNumber);
    }
    if (lastOp == "4") {
      result = await operationService.destuffLclContainer(containerNumber);
    }
    if (lastOp == "10") {
      result = await operationService.getInDataFechByContainerNumber(
        containerNumber
      );
    }
    console.log("result::", result);
    if (result?.success) {
      setPreviousData(result.data);
      console.log("previous::", previousData);
    }
  };

  useEffect(() => {
    getpreviousData();
  }, [containerNumber]);

  useEffect(() => {
    if (!previousData) return;

    setFormData((prev) => ({
      ...prev,
      yardName:
        previousData.yard_id ?? previousData.yard ?? previousData.yardId ?? "",

      status:
        previousData.status ??
        previousData.containerCondition ??
        previousData.containerStatus ??
        previousData.container_condition ??
        previousData.container_status ??
        "",

      mainRemark: previousData.remarks ?? "",

      loadStatus: "empty",
    }));
  }, [previousData]);

  const handleSubmit = async () => {
    try {
      if (
        !formData.allotmentDate ||
        !formData.transportMode ||
        !formData.yardName
      ) {
        toast.error("Please fill all required fields.");
        return;
      }

      const formattedDate = moment(formData.allotmentDate, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      );

      let payload;

      // for road
      if (formData.transportMode == "road") {
        payload = {
          containerNo: formData.containerNumber,
          allotment_date: formattedDate,
          transport_mode: "road",
          yard_id: Number(formData.yardName),
          gate_out_for: formData.getOutFor,
          destination_place: formData.destinationPlace,
          transporter: formData.transporter,
          pol: formData.pol,
          ref_no: formData.refNumber,
          remark: formData.mainRemark,
          dispatch_to_port_data: null,
          load_status: formData.loadStatus,
          status: formData.status,
        };
      }
      // for rail
      if (formData.transportMode == "rail") {
        payload = {
          containerNo: formData.containerNumber,
          allotment_date: formattedDate,
          yard_id: Number(formData.yardName) || null,
          transport_mode: "rail",
          gate_out_for: null,
          destination_place: null,
          transporter: null,
          pol: formData.pol,
          ref_no: formData.refNumber,
          remark: formData.mainRemark,
          dispatch_to_port_data: null,
          load_status: formData.loadStatus,
          status: formData.status,
        };
      }
      console.log("payload::", payload);

      const res = await operationService.allotmentER(payload);

      if (res.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED ALLOTMENT-ER OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${res.data.id}`
        );
        localStorage.setItem("operation", 20);
        navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
      } else {
        toast.error(res.message || "Something went wrong.");
      }

      console.log("Payload::", payload);
    } catch (error) {
      console.error("Save failed:", error?.response?.data || error.message);
      toast.error(
        error?.response?.data?.message || "Failed to save Allotment ER"
      );
    }
  };

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchYards());
    dispatch(fetchICDs());
    dispatch(fetchTransporters());
  }, [dispatch, containerNumber]);

  useEffect(() => {
    if (fetchedContainer) {
      setFormData((prev) => ({
        ...prev,
        containerNumber: fetchedContainer?.container_number || "",
        shippingLineId:
          fetchedContainer?.shipping_line_id ||
          fetchedContainer?.shippingLineId,
        size: fetchedContainer?.size || "",
        type: fetchedContainer?.container_type || "",
        tareWeight: fetchedContainer?.tare_weight || "",
        mgWeight: fetchedContainer?.mg_weight || "",
        mfdDate: fetchedContainer?.mfd_date || "",
        cscValidity: fetchedContainer?.csc_validity || "",
        remarks: fetchedContainer?.remarks || "",
      }));
    }
  }, [fetchedContainer]);

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
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Out Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (inputDate.isAfter(current)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be more than 3 days in the past",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Allotment ER"
        parent="Apps"
        title="Allotment ER"
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
              <h5 className="mb-3 mt-5">Allotment Empty Repositioning</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Allotment Date</label>
                  <input
                    type="text"
                    name="allotmentDate"
                    placeholder="DD-MM-YYYY"
                    value={formData.allotmentDate}
                    onChange={handleDateChange}
                    className={`form-control ${
                      formErrors.allotmentDate ? "is-invalid" : ""
                    }`}
                  />
                  {formErrors.allotmentDate && (
                    <div className="invalid-feedback">
                      {formErrors.allotmentDate}
                    </div>
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Transport Mode</label>
                  <select
                    name="transportMode"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.transportMode}
                  >
                    <option value="">Select Transport Mode</option>
                    <option value="road">Road</option>
                    <option value="rail">Rail</option>
                  </select>
                </Col>
                <Col md="6">
                  <label>Yard Name</label>
                  <select
                    name="yardName"
                    onChange={handleChange}
                    value={formData.yardName}
                    className={`form-select ${
                      formErrors.yardName ? "is-invalid" : ""
                    }`}
                  >
                    <option value="">Select Yard</option>
                    {yards.map((yard) => (
                      <option key={yard.id} value={yard.id}>
                        {yard.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.yardName && (
                    <div className="invalid-feedback">{formErrors.yardId}</div>
                  )}
                </Col>
              </Row>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Transport Detail</h5>
                {formData.transportMode === "road" && (
                  <Row className="mb-3">
                    <Col md="4">
                      <label className="large mb-1">Get Out For</label>
                      <select
                        name="getOutFor"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.getOutFor}
                        disabled={formData.transportMode == "rail"}
                      >
                        <option value="">Get Out For</option>
                        <option value="MOVE TO OTHER YARD">
                          Move to Other Yard
                        </option>
                        <option value="MOVE TO OTHER ICD SITES">
                          Move to Other ICD
                        </option>
                        <option value="DISPATCH TO PORT">
                          Dispatch to PORT
                        </option>
                      </select>
                    </Col>
                    <Col md="4">
                      <label className="large mb-1">
                        {formData.getOutFor === "MOVE TO OTHER YARD"
                          ? "Select Yards"
                          : formData.getOutFor === "MOVE TO OTHER ICD SITES"
                          ? "Select ICD"
                          : formData.getOutFor === "DISPATCH TO PORT"
                          ? "Enter Port Name"
                          : ""}
                      </label>
                      {formData.getOutFor === "MOVE TO OTHER YARD" ? (
                        <select
                          name="destinationPlace"
                          className="form-select"
                          onChange={handleChange}
                          disabled={formData.transportMode == "rail"}
                          value={formData.destinationPlace}
                        >
                          <option value="">Select Yard</option>
                          {yardsLoading ? (
                            <option>Loading...</option>
                          ) : (
                            data.map((yard) => (
                              <option key={yard.id} value={yard.name}>
                                {yard.name}
                              </option>
                            ))
                          )}
                        </select>
                      ) : formData.getOutFor === "MOVE TO OTHER ICD SITES" ? (
                        <select
                          name="destinationPlace"
                          className="form-select"
                          onChange={handleChange}
                          disabled={formData.transportMode == "rail"}
                          value={formData.destinationPlace}
                        >
                          <option value="">Select ICD</option>
                          {icds.map((icd) => (
                            <option key={icd.id} value={icd.name}>
                              {icd.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        formData.getOutFor === "DISPATCH TO PORT" && (
                          <input
                            name="destinationPlace"
                            className="form-control"
                            placeholder="Enter Port Name"
                            onChange={handleChange}
                            disabled={formData.transportMode == "rail"}
                            value={formData.destinationPlace}
                          />
                        )
                      )}
                    </Col>

                    <Col md="4">
                      <label>Transporter</label>
                      <select
                        name="transporter"
                        className="form-select"
                        onChange={handleChange}
                        disabled={formData.transportMode == "rail"}
                        value={
                          formData.transporter
                            ? String(formData.transporter)
                            : ""
                        }
                      >
                        <option value="">Select Transporter</option>
                        {transportersLoading ? (
                          <option disabled>Loading...</option>
                        ) : (
                          transporters.map((transporter) => (
                            <option
                              key={transporter.id}
                              value={String(transporter.id)}
                            >
                              {`${transporter.name} -- ${transporter.code}`}
                            </option>
                          ))
                        )}
                      </select>
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
                  <Col md="6">
                    <label>Load Status</label>
                    <select
                      name="loadStatus"
                      className={`form-select ${
                        formErrors.loadStatus ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.loadStatus}
                      disabled
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                  </Col>
                  <Col md="4">
                    <label className="large mb-1">Refrence Number</label>
                    <input
                      name="refNumber"
                      className="form-control"
                      placeholder="Refrence Number"
                      onChange={handleChange}
                      value={formData.refNumber}
                    />
                  </Col>
                </Row>
              </div>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">POL</label>
                  <input
                    name="pol"
                    type="text"
                    className="form-control"
                    placeholder="pol"
                    value={formData.pol}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Container Condition</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="form-label">Container Status</label>
                    <select
                      name="status"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.status}
                    >
                      <option value="">Select Status</option>
                      <option value="Sound">Sound</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </Col>
                  <Col md="6">
                    <label className="form-label">Remarks</label>
                    <textarea
                      name="mainRemark"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.mainRemark}
                      placeholder="Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>
              <div className="mb-3 mt-3">
                <button className="btn btn-primary w-25" onClick={addForm}>
                  Add Rows
                </button>

                {formList.map((form, index) => (
                  <div key={form.id} className="mt-4 p-4 border rounded ">
                    <div className="row">
                      {Object.keys(form).map((field) => (
                        <div key={field} className="col-md-4 mb-2">
                          <label className="form-label">
                            {field
                              .split(/(?=[A-Z])/)
                              .join(" ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </label>
                          <input
                            type={getInputType(field)}
                            value={form[field]}
                            onChange={(e) =>
                              handleInputChange(index, field, e.target.value)
                            }
                            className="form-control"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-end col-12">
                      <button
                        onClick={() => cancelForm(index)}
                        className="btn btn-danger mt-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSubmit}
                >
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

export default AllotmentER;
