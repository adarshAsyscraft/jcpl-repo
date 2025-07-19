import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Label, Row, Form } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpectedContainer } from "../../Redux/slices/expectedArrivalSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import {
  fetchContainerByNumber,
  getPrefillData,
} from "../../Redux/slices/containerSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import ContainerDetailsSection from "./containerDetails";
import { Select } from "antd";
const { Option } = Select;

const ExpectedArrivalContainer = () => {
  const { containerNumber } = useParams();
  // const [errors, setErrors] = useState(false);
  const [formErrors, setFormErrors] = useState({
    transportMode: "",
    loadStatus: "",
    transporter: "",
    forwarder2: "",
  });
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fetchedContainer } = useSelector((state) => state.container);

  const selectedOperation = location.state?.operation || "1";

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());
  }, [dispatch]);

  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  const { data: containerTypes = [], loading: containerTypesLoading } =
    useSelector((state) => state.containerTypes || {});
  const { data: yards = [], loading: yardsLoading } = useSelector(
    (state) => state.yards || {}
  );
  const transportersState = useSelector((state) => state.transporters);
  const transporters = transportersState?.data || [];

  const [formData, setFormData] = useState({
    containerNumber: "",
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    remarks: "",
    operation: "",
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    containerRemarks: "",
    loadStatus: "",
    transporter: "",
    wagonNumber: "",
    train_truck_no: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      containerNumber: fetchedContainer?.container_number || "",
      shippingLineId: fetchedContainer?.shipping_line_id || "",
      size: fetchedContainer?.size || "",
      type: fetchedContainer?.container_type || "",
      tareWeight: fetchedContainer?.tare_weight || "",
      mgWeight: fetchedContainer?.mg_weight || "",
      mfdDate: fetchedContainer?.mfd_date || "",
      cscValidity: fetchedContainer?.csc_validity || "",
      remarks: fetchedContainer?.remarks || "",
      operation: selectedOperation || "",
    }));
  }, [containerNumber, location.state, selectedOperation, fetchedContainer]);

  const validateForm = (data) => {
    const newErrors = {};
    let isValid = true;

    if (!data.transportMode) {
      newErrors.transportMode = "Transport mode is required";
      isValid = false;
    }
    if (!data.loadStatus) {
      newErrors.loadStatus = "Load status is required";
    }

    if (data.transportMode === "road" && !data.transporter) {
      newErrors.transporter = "Transporter is required for Road transport";
    }

    if (
      data.forwarder1 &&
      data.forwarder2 &&
      data.forwarder1 == data.forwarder2
    ) {
      newErrors.forwarder2 = "Forwarders must be different";
    }

    setFormErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name == "containerRemarks" || e.target.type == "text") {
      value = value.toUpperCase();
    }

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      if (name === "transportMode") {
        setFormErrors((prev) => ({
          ...prev,
          [name]: value ? "" : "Transport Mode is Required",
        }));
      }

      if (name === "loadStatus") {
        setFormErrors((prev) => ({
          ...prev,
          [name]: value ? "" : "Load Status is Required",
        }));
      }

      if (
        updatedForm.forwarder1 &&
        updatedForm.forwarder2 &&
        updatedForm.forwarder1 === updatedForm.forwarder2
      ) {
        setFormErrors((prev) => ({
          ...prev,
          ["forwarder2"]: value
            ? ""
            : "Forwarder 1 abd Forwarder 2 is not same ",
        }));
      }

      return updatedForm;
    });
  };

  const handleSave = async () => {
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      const payload = {
        size: formData.size || null,
        type: formData.type || null,
        tareWeight: formData.tareWeight || null,
        mfdDate: formData.mfdDate || null,
        mgWeight: formData.mgWeight || null,
        cscValidity: formData.cscValidity || null,
        forwarder1: formData.forwarder1 || null,
        forwarder2: formData.forwarder2 || null,
        containerNumber: formData.containerNumber,
        transportMode: formData.transportMode || null,
        loadStatus: formData.loadStatus || null,
        transporter_id: formData.transporter || null,
        wagon_no: formData.wagonNumber || null,
        yardName: formData.yardName || null,
        train_truck_no: formData.train_truck_no || null,
        pol: formData.pol || null,
        shippingLineId: formData.shippingLineId || null,
        shippingLineSeal: formData.shippingLineSeal || null,
        remarks: formData.containerRemarks || null,
        operation: "1",
      };

      const response = await dispatch(
        createExpectedContainer(payload)
      ).unwrap();

      if (
        response?.data?.message === "Expected container created successfully"
      ) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED EXPECTED ARRIVAL OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error("Error while creating container:", error);
      toast.error("Failed to create container!");
    }
  };

  console.log("forwarders::", forwarders);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Expected Arrival Container"
        parent="Apps"
        title="Expected Arrival Container"
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

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Client Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Shipping Line</Label>
                    <Select
                      style={{ width: "100%" }}
                      value={
                        formData.shippingLineId
                          ? String(formData.shippingLineId)
                          : undefined
                      }
                      onChange={(value) =>
                        handleChange("shippingLineId", value)
                      }
                      placeholder="Select Shipping Line"
                      loading={forwardersLoading}
                      disabled
                      size="middle"
                    >
                      {forwarders
                        .filter((fwd) => fwd.category == "shipping") // <-- Filter applied here
                        .map((fwd) => (
                          <Option key={fwd.id} value={String(fwd.id)}>
                            {fwd.name}
                          </Option>
                        ))}
                    </Select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Forwarder1 Code Name</Label>
                    <select
                      name="forwarder1"
                      className="form-control"
                      // className={`form-select form-select-sm ${formErrors.forwarder1 ? 'is-invalid' : ''}`}
                      onChange={handleChange}
                      value={formData.forwarder1}
                    >
                      <option value="">Select Forwarder</option>
                      {forwarders
                        .filter((fwd) => fwd.category == "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                    {/* {formErrors.forwarder1 && <div className="invalid-feedback">{formErrors.forwarder1}</div>} */}
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Forwarder2 Code Name</Label>
                    <select
                      name="forwarder2"
                      className={`form-control`}
                      onChange={handleChange}
                      value={formData.forwarder2}
                    >
                      <option value="">Select Forwarder</option>
                      {forwarders
                        .filter((fwd) => fwd.category == "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                    {/* {formErrors.forwarder2 && <div className="text-danger">{formErrors.forwarder2}</div>} */}
                    {formErrors.forwarder2 && (
                      <span className="text-danger">
                        Forwarder1 Code Name and Forwarder2 Code Name not Same
                      </span>
                    )}
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Transport Detail</h5>

                {/* Transport Mode & Load Status */}
                <Row className="mb-3">
                  <Col md="4">
                    <Label className="large mb-1">Yard Name</Label>
                    <select
                      name="yardName"
                      className={`form-select ${
                        formErrors.yardName ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.yardName}
                    >
                      <option value="">Select Yard</option>
                      {yards.map((yard) => (
                        <option key={yard.id} value={yard.id}>
                          {yard.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.yardName && (
                      <div className="invalid-feedback">
                        {formErrors.yardName}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Transport Mode</Label>
                    <select
                      name="transportMode"
                      className={`form-select ${
                        formErrors.transportMode ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.transportMode}
                    >
                      <option value="">Transport Mode</option>
                      <option value="rail">Rail</option>
                      <option value="road">Road</option>
                    </select>
                    {formErrors.transportMode && (
                      <div className="invalid-feedback">
                        {formErrors.transportMode}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Load Status</Label>
                    <select
                      name="loadStatus"
                      className={`form-select ${
                        formErrors.loadStatus ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.loadStatus}
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                    {formErrors.loadStatus && (
                      <div className="invalid-feedback">
                        {formErrors.loadStatus}
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Transporter & Train/Truck No */}
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Transporter</Label>
                    {formData.transportMode === "rail" ? (
                      <input
                        name="transporter"
                        className="form-control"
                        placeholder="Transporter"
                        onChange={handleChange}
                        value={formData.transporter || ""}
                        disabled
                      />
                    ) : (
                      <select
                        name="transporter"
                        className={`form-select ${
                          formErrors.transporter ? "is-invalid" : ""
                        }`}
                        onChange={handleChange}
                        value={
                          formData.transporter
                            ? String(formData.transporter)
                            : ""
                        }
                      >
                        <option value="">Select Transporter</option>
                        {transporters.map((transporter) => (
                          <option
                            key={transporter.id}
                            value={String(transporter.id)}
                          >
                            {`${transporter.name} -- ${transporter.code}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.transporter && (
                      <div className="invalid-feedback">
                        {formErrors.transporter}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Wagon Number</Label>
                    <input
                      name="wagonNumber"
                      type={
                        formData.transportMode === "road" ? "number" : "text"
                      }
                      className={`form-control ${
                        formErrors.wagonNumber ? "is-invalid" : ""
                      }`}
                      placeholder="Wagon Number"
                      onChange={handleChange}
                      value={formData.wagonNumber || ""}
                      disabled={formData.transportMode === "road"}
                    />
                    {/* {formErrors.wagonNumber && (
                      <div className="invalid-feedback">
                        {formErrors.wagonNumber}
                      </div>
                    )} */}
                  </Col>
                </Row>

                {/* Wagon Number & POL */}
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Train/Truck Number</Label>
                    <input
                      name="train_truck_no"
                      className={`form-control ${
                        formErrors.train_truck_no ? "is-invalid" : ""
                      }`}
                      placeholder="Train/Truck No"
                      onChange={handleChange}
                      value={formData.train_truck_no}
                    />
                    {formErrors.train_truck_no && (
                      <div className="invalid-feedback">
                        {formErrors.train_truck_no}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Pol</Label>
                    <input
                      name="pol"
                      className={`form-control ${
                        formErrors.pol ? "is-invalid" : ""
                      }`}
                      placeholder="pol"
                      onChange={handleChange}
                      value={formData.pol}
                    />
                    {formErrors.pol && (
                      <div className="invalid-feedback">{formErrors.pol}</div>
                    )}
                  </Col>
                </Row>

                {/* Shipping Line Seal & Yard Name */}
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Shipping Line Seal</Label>
                    <input
                      name="shippingLineSeal"
                      className={`form-control ${
                        formErrors.shippingLineSeal ? "is-invalid" : ""
                      }`}
                      placeholder="Shipping Line Seal"
                      onChange={handleChange}
                      value={formData.shippingLineSeal}
                    />
                    {formErrors.shippingLineSeal && (
                      <div className="invalid-feedback">
                        {formErrors.shippingLineSeal}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Container Condition</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Remarks</Label>
                    <textarea
                      name="containerRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.containerRemarks}
                      placeholder="Any Other Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>

              <div className="text-center mt-4">
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

export default ExpectedArrivalContainer;
