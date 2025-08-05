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
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";

const DeAllotment = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { containerNumber } = useParams();
  const selectedOperation = location.state?.operation || "";
  const [formErrors, setFormErrors] = useState({});
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");

  const [addContainer, setAddContainer] = useState([]);

  const [formData, setFormData] = useState({
    containerNumber,
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    operation: selectedOperation,
    deAllotmentDate: "",
    addContainer: "",
    remarks: "",
    containerRemark: "",
  });

  const { fetchedContainer } = useSelector((state) => state.container);
  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const {
    data = [],
    loading: yardsLoading,
    error: yardsError,
  } = useSelector((state) => state.yards || {});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "containerRemark") {
      // Convert remarks to uppercase
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else if (name === "addContainer") {
      // Split by space or comma and store the array
      const array = value.split(/[\s,]+/).filter((item) => item.trim() !== "");
      setFormData((prev) => ({
        ...prev,
        addContainer: value.toUpperCase(),
      }));
      setAddContainer(array);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    addContainer.push(formData.containerNumber);

    const mandatoryFields = {
      deAllotmentDate: "De Allotment Date",
      containerRemark: "Remarks",
    };

    const emptyFields = Object.keys(mandatoryFields).filter(
      (fields) => !formData[fields]
    );

    if (emptyFields.length > 0) {
      const missingFieldsList = emptyFields
        .map((field) => mandatoryFields[field])
        .join(", ");
      toast.error(`PLEASE FILL THE MANDATORY FIELDS: ${missingFieldsList}`);
      return;
    }

    const inputDate = moment(formData.deAllotmentDate, "DD-MM-YYYY");
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    if (!inputDate.isValid()) {
      toast.error("Invalid De-Allotment Date");
      setFormErrors((prev) => ({
        ...prev,
        deAllotmentDate: "Invalid date",
      }));
      return;
    }

    if (inputDate.isAfter(current)) {
      toast.error("De-Allotment Date cannot be in Future");
      setFormErrors((prev) => ({
        ...prev,
        deAllotmentDate: "Date cannot be in Future",
      }));
      return;
    }

    if (inputDate.isBefore(minimum)) {
      toast.error("De-Allotment date cannot be more than 3 days in the past");
      setFormErrors((prev) => ({
        ...prev,
        deAllotmentDate: "Date cannot be more than 3 days in the past",
      }));
      return;
    }

    const payload = {
      containerNumbers: addContainer || [formData.containerNumber],
      de_allotment_date: formData.deAllotmentDate,
      remark: formData.containerRemark,
    };

    try {
      const response = await operationService.createDeAllotment(payload);
      if (response?.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED DE-ALLOTMENT FOR ${addContainer}. WHERE ENTRY ID IS ${response.data}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error(response?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error creating De-Allotment container:", error);
      toast.error(error.message || "Failed to create De-Allotment container");
    }

    console.log("Payload::", payload);
  };

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchYards());
  }, [dispatch]);

  useEffect(() => {
    if (fetchedContainer) {
      setFormData((prev) => ({
        ...prev,
        containerNumber: fetchedContainer.container_number || "",
        shippingLineId: fetchedContainer.shipping_line_id || "",
        size: fetchedContainer.size || "",
        type: fetchedContainer.container_type || "",
        tareWeight: fetchedContainer.tare_weight || "",
        mgWeight: fetchedContainer.mg_weight || "",
        mfdDate: fetchedContainer.mfd_date || "",
        cscValidity: fetchedContainer.csc_validity || "",
        remarks: fetchedContainer.remarks || "",
      }));
    }
  }, [fetchedContainer]);

  const handleDateChange = (e) => {
    let { name, value } = e.target;

    value = value.replace(/\D/g, "");

    // Limit to 8 digits (DDMMYYYY)
    if (value.length > 8) value = value.slice(0, 8);

    // Auto-insert dashes as DD-MM-YYYY
    if (value.length >= 5) {
      value =
        value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
    } else if (value.length >= 3) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    const isValidFormat =
      /^(0[1-9]|[12][0-9]|3[01])([-/.])(?:0[1-9]|1[0-2])\2\d{4}$/.test(value);

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
        [name]: "Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Invalid Date",
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
        mainTitle="De-Allotment"
        parent="Apps"
        title="De-Allotment"
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

              <h5 className="mb-3 mt-5">De Allotment Details</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label>
                    De Allotment Date{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <input
                    name="deAllotmentDate"
                    type="text"
                    className={`form-control ${
                      formErrors.deAllotmentDate ? "is-invalid" : ""
                    }`}
                    onChange={handleDateChange}
                    value={formData.deAllotmentDate}
                    placeholder="DD-MM-YYYY"
                  />
                  {formErrors.deAllotmentDate && (
                    <div className="invalid-feedback">
                      {formErrors.deAllotmentDate}
                    </div>
                  )}
                </Col>
                <Col md="6">
                  <label>Add Containers</label>
                  <input
                    type="text"
                    className="form-control"
                    name="addContainer"
                    onChange={handleChange}
                    value={formData.addContainer}
                    placeholder="Add containers (comma or space separated)"
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label>
                    Remarks <span className="large mb-1 text-danger">*</span>
                  </label>
                  <textarea
                    name="containerRemark"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.containerRemark}
                    placeholder="Remarks"
                    style={{ textTransform: "uppercase" }}
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

export default DeAllotment;
