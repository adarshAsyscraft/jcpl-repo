import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpectedContainer } from "../../Redux/slices/expectedArrivalSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";

const OnHire = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [errors, setErrors] = useState({});
  const yardsState = useSelector((state) => state.yards || {});
  const yards = yardsState?.data || [];
  const [formErrors, setFormErrors] = useState({});

  const selectedOperation = location.state?.operation || "1";
  const {
    fetchedContainer,
    loading: containerLoading,
    error: containerError,
  } = useSelector((state) => state.container);

  // Fetch container details when containerNumber changes
  useEffect(() => {
    if (containerNumber) {
      dispatch(fetchContainerByNumber(containerNumber));
    }
  }, [containerNumber, dispatch]);

  // Fetch other dropdown data (forwarders, yards, containerTypes)
  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
  }, [dispatch]);

  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});

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
    operation: selectedOperation || "",
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    yardId: "",
    hireFrom: "",
    hireTo: "",
    onHireDate: "",
  });

  // Update formData when container details are fetched
  useEffect(() => {
    if (fetchedContainer) {
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
    }
  }, [fetchedContainer, selectedOperation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
        [name]: "Date is required",
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

  const handleSave = async () => {
    const payload = {
      container_id: fetchedContainer.id,
      hire_from_id: formData.hireFrom,
      hire_to_id: formData.hireTo,
      on_hire_date: moment(formData.onHireDate, "DD-MM-YYYY").format(
        "YYYY-MM-DD"
      ),
      yardId: formData.yardId,
    };

    try {
      const res = await operationService.onHire(payload);
      if (res.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED ONHIRE OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${res.data.id}`
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

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="On Hire of Container"
        parent="Apps"
        title="On Hire of Container"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              {/* Container Details Section */}
              <div className="shadow-sm p-4 mt-4">
                <ContainerDetailsSection
                  formData={formData}
                  handleChange={handleChange}
                  forwarders={forwarders}
                  forwardersLoading={forwardersLoading}
                  fetchedContainer={fetchedContainer}
                  disabled={true}
                />
              </div>

              {/* Off Hire Details Section */}
              <div className="shadow-sm p-4 mt-4">
                <h5 className="mb-3 mt-5">On Hire Details</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Hired Date</label>
                    <input
                      name="onHireDate"
                      type="text"
                      placeholder="DD-MM-YYYY"
                      className={`form-control ${
                        errors.onHireDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDateChange}
                      value={formData.onHireDate}
                    />
                    {errors?.onHireDate && (
                      <div className="invalid-feedback">
                        {errors.onHireDate}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label>Yard Name</label>
                    <select
                      name="yardId"
                      onChange={handleChange}
                      value={formData.yardId}
                      className={`form-select ${
                        formErrors.yardId ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select Yard</option>
                      {yards.map((yard) => (
                        <option key={yard.id} value={yard.id}>
                          {yard.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.yardId && (
                      <div className="invalid-feedback">
                        {formErrors.yardId}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Hired From</label>
                    <select
                      name="hireFrom"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.hireFrom}
                    >
                      <option value="">Select Shipping Line</option>
                      {forwarders &&
                        forwarders.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                  <Col md="6">
                    <label>Hired To</label>
                    <select
                      name="hireTo"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.hireTo}
                    >
                      <option value="">Select Shipping Line</option>
                      {forwarders &&
                        forwarders.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                </Row>
              </div>

              {/* Save Button */}
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

export default OnHire;
