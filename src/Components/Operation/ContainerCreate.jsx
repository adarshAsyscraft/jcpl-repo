import React, { Fragment, useContext, useState, useEffect } from "react";
import { Breadcrumbs } from "../../AbstractElements";
import {
  Col,
  Container,
  Row,
  Card,
  CardBody,
  Button,
  Input,
  Form,
  Label,
} from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { createContainer } from "../../Redux/slices/containerSlice";
import moment from "moment";

const ContainerCreate = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
  }, [dispatch]);

  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const {
    data: containerTypes = [],
    loading: containerTypesLoading,
    error: containerTypesError,
  } = useSelector((state) => state.containerTypes || {});

  const containerNumber = location.state?.containerNumber || "";
  const selectedOperation = location.state?.operation || "";

  const [formData, setFormData] = useState({
    containerNumber,
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "ACEP",
    remarks: "",
    operation: selectedOperation,
  });

  const [errors, setErrors] = useState({});

  const validate = (data = formData) => {
    const newErrors = {};

    if (!data.shippingLineId)
      newErrors.shippingLineId = "Shipping Line is required.";
    if (!data.size) newErrors.size = "Size is required.";
    if (!data.type) newErrors.type = "Container Type is required.";

    // Strict MM-YYYY validation (01-12 for month)
    if (data.mfdDate && data.mfdDate.trim() !== "") {
      const isValidFormat = /^(0[1-9]|1[0-2])[-/.]\d{4}$/.test(data.mfdDate);
      if (!isValidFormat) {
        newErrors.mfdDate =
          "Date must be in MM-YYYY format with a valid month.";
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "remarks") {
      value = value.toUpperCase();
    }

    // Numeric validation
    if (name === "tareWeight" && !/^\d{0,4}$/.test(value)) return;
    if (name === "mgWeight" && !/^\d{0,5}$/.test(value)) return;

    if (name === "mfdDate") {
      value = value.replace(/\D/g, ""); // Remove all non-digits
      if (value.length > 6) return; // Max 6 digits

      if (value.length >= 3) {
        value = value.slice(0, 2) + "-" + value.slice(2);
      }
      const updatedFormData = { ...formData, [name]: value };
      setFormData(updatedFormData);

      const newErrors = validate(updatedFormData);
      setErrors(newErrors);
      return;
    }

    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Validate on change
    const newErrors = validate(updatedFormData);
    setErrors(newErrors);
  };

  const handleSave = async () => {
    // const newErrors = validate();
    // setErrors(newErrors);

    // if (Object.keys(newErrors).length > 0) return;

    const operationRoutes = {
      1: "/app/expected-arrival-container",
      2: "/app/arrival-container",
      3: "/app/destuff-fcl-container",
      4: "/app/destuff-lcl-container",
      5: "/app/destuffing-lcl-request",
      6: "/app/icd-stuffing",
      7: "/app/carting-lcl-container",
      8: "/app/factory-stuffing",
      9: "/app/stuffing-lcl",
      10: "/app/gate-in-container",
      11: "/app/gate-out-container",
      12: "/app/seven-point-checklist",
      13: "/app/soc-inspection",
      14: "/app/empty-container-inspection",
      15: "/app/dispatch-container",
      17: "/app/off-hire",
      18: "/app/on-hire",
      19: "/app/allotment-stuffing",
      20: "/app/allotment-er",
      21: "/app/de-allotment/:layout",
      22: "/app/measurement-details",
      23: "/app/on-hire",
    };

    const route = operationRoutes[formData.operation];
    if (!route) {
      console.warn("Invalid operation value:", formData.operation);
      return;
    }

    const operationsWithContainerNumber = new Set([
      "1",
      "2",
      "3",
      "4",
      "6",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ]);

    const path = operationsWithContainerNumber.has(formData.operation)
      ? `${process.env.PUBLIC_URL}${route}/${formData.containerNumber}/${layoutURL}`
      : `${process.env.PUBLIC_URL}${route}`;

    const payload = {
      containerNumber: formData.containerNumber,
      shippingLineId: parseInt(formData.shippingLineId),
      size: formData.size,
      containerType: formData.type,
      tareWeight: formData.tareWeight || "",
      mgWeight: formData.mgWeight || "",
      mfdDate: moment(formData.mfdDate, "MM-YYYY").format("YYYY-MM") || "",
      cscValidity: formData.cscValidity || "",
      remarks: formData.remarks || "",
    };

    const res = await dispatch(createContainer(payload));
    if (res.payload.success) {
      navigate(path, { state: formData });
      localStorage.removeItem("operation");
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Container Create"
        parent="Apps"
        title="Container Create"
      />
      <Container fluid className="d-flex justify-content-center">
        <Row className="w-100 justify-content-center">
          <Col md="8" lg="6">
            <Card className="shadow border-0 p-3">
              <CardBody>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Button
                    color="light"
                    className="rounded-circle"
                    onClick={() =>
                      navigate(
                        `${process.env.PUBLIC_URL}/app/operation/${layoutURL}`
                      )
                    }
                    style={{ fontSize: "18px", padding: "6px 10px" }}
                  >
                    &larr;
                  </Button>
                  <h4 className="text-center flex-grow-1 m-0">
                    Container Details
                  </h4>
                </div>

                {forwardersError && (
                  <div className="alert alert-danger">
                    Failed to load forwarders: {forwardersError}
                  </div>
                )}
                {containerTypesError && (
                  <div className="alert alert-danger">
                    Failed to load container types: {containerTypesError}
                  </div>
                )}

                <Form style={{ maxWidth: "600px", margin: "0 auto" }}>
                  <Row className="gy-2">
                    <Col md="12">
                      <Label className="large mb-1">Container Number</Label>
                      <Input
                        name="containerNumber"
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.containerNumber}
                        readOnly
                      />
                    </Col>

                    <Col md="12">
                      <Label className="large mb-1">Shipping Line</Label>
                      <Input
                        name="shippingLineId"
                        type="select"
                        className="form-select form-select-sm"
                        onChange={handleChange}
                        value={formData.shippingLineId}
                      >
                        <option value="">Select Shipping Line</option>
                        {forwardersLoading ? (
                          <option>Loading...</option>
                        ) : (
                          forwarders
                            .filter((res) => res.category === "shipping")
                            .map((fwd) => (
                              <option key={fwd.id} value={fwd.id}>
                                {fwd.name}
                              </option>
                            ))
                        )}
                      </Input>
                      {errors.shippingLineId && (
                        <small className="text-danger">
                          {errors.shippingLineId}
                        </small>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="large mb-1">Container Size</Label>
                      <Input
                        name="size"
                        type="select"
                        className="form-select form-select-sm"
                        onChange={handleChange}
                        value={formData.size}
                      >
                        <option value="">Select Size</option>
                        <option value="20">20</option>
                        <option value="40">40</option>
                      </Input>
                      {errors.size && (
                        <small className="text-danger">{errors.size}</small>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="large mb-1">Container Type</Label>
                      <Input
                        name="type"
                        type="select"
                        className="form-select form-select-sm"
                        onChange={handleChange}
                        value={formData.type}
                      >
                        <option value="">Select Type</option>
                        {containerTypesLoading ? (
                          <option>Loading...</option>
                        ) : (
                          containerTypes.map((type) => (
                            <option key={type.id} value={type.code}>
                              {type.code}
                            </option>
                          ))
                        )}
                      </Input>
                      {errors.type && (
                        <small className="text-danger">{errors.type}</small>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="large mb-1">Tare Weight</Label>
                      <Input
                        name="tareWeight"
                        type="text"
                        className="form-control form-control-sm"
                        onChange={handleChange}
                        value={formData.tareWeight}
                        placeholder="Tare Weight"
                      />
                    </Col>
                    <Col md="6">
                      <Label className="large mb-1">MG Weight</Label>
                      <Input
                        name="mgWeight"
                        type="text"
                        className="form-control form-control-sm"
                        onChange={handleChange}
                        value={formData.mgWeight}
                        placeholder="MG Weight"
                      />
                    </Col>

                    <Col md="6">
                      <Label className="large mb-1">MFD Date</Label>
                      <Input
                        name="mfdDate"
                        type="text"
                        placeholder="MM-YYYY"
                        className={`form-control form-control-sm`}
                        onChange={handleChange}
                        value={formData.mfdDate}
                      />
                      {errors.mfdDate && (
                        <small className="text-danger">{errors.mfdDate}</small>
                      )}
                    </Col>

                    <Col md="6">
                      <Label className="large mb-1">CSC Validity</Label>
                      <Input
                        name="cscValidity"
                        type="text"
                        className="form-control form-control-sm"
                        onChange={handleChange}
                        value={formData.cscValidity}
                        placeholder="Examples-2025-04-03"
                      />
                    </Col>
                    <Col md="12">
                      <Label className="large mb-1">Remarks</Label>
                      <textarea
                        name="remarks"
                        className="form-control"
                        rows="3"
                        onChange={handleChange}
                        value={formData.remarks}
                        placeholder="Remarks"
                      ></textarea>
                    </Col>
                  </Row>

                  <Button
                    color="success"
                    className="w-100 mt-3 py-1 fw-semibold"
                    onClick={handleSave}
                  >
                    Save Container
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default ContainerCreate;
