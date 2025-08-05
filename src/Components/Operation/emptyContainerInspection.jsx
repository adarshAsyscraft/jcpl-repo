import React, { Fragment, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, Label } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useSelector, useDispatch } from "react-redux";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";
import ImageUploadWithPreview from "../Common/ImageUpload/ImageUpload";
import SelectableInput from "../Common/SelectableInput/selectableInput";

const EmptyContainerInspection = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOperation = location.state?.operation || "";
  const { containerNumber } = useParams();
  const { icds } = useSelector((state) => state.icd);
  const yards = useSelector((state) => state.yards);
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]);
  const [surveyClient, setSurveyClient] = useState([]);

  const { fetchedContainer } = useSelector((state) => state.container);
  const { data: forwarders = [] } = useSelector(
    (state) => state.forwarders || {}
  );
  const { data: containerTypes = [] } = useSelector(
    (state) => state.containerTypes || {}
  );

  const [formData, setFormData] = useState({
    containerNumber: fetchedContainer.container_number || "",
    shippingLineId: fetchedContainer?.shipping_line_id || "",
    size: fetchedContainer.size || "",
    type: fetchedContainer.container_type || "",
    tareWeight: fetchedContainer.tare_weight || "",
    mgWeight: fetchedContainer.mg_weight || "",
    mfdDate: fetchedContainer.mfd_date || "",
    cscValidity: fetchedContainer.csc_validity || "",
    remark: fetchedContainer.remark || "",
    operation: selectedOperation,
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    yardName: "",
    nameOfIcd: "",
    customICD: "",
    customYard: "",
    clientName: "",
    inspectedBy: "",
    bookingNumber: "",
    dateOfInspection: "",
    rightSidePanel: "ok",
    leftSidePanel: "ok",
    frontPanel: "ok",
    door: "ok",
    roof: "ok",
    floors: "ok",
    internalPanel: "ok",
    underStructure: "not-sighted",
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    containerRemarks:
      "THE CONTAINER WAS INSPECTED AS PER CARGO WORTHY  STANDARD AND FOUND FIT",
  });

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchICDs());
  }, [dispatch, containerNumber]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name == "remarks" || e.target.type == "text") {
      value = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = async (e) => {
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
        [name]: "Date is required",
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

  const fetchSurveyClient = async () => {
    const res = await operationService.getClientSurvey();
    setSurveyClient(res.data);
  };

  useEffect(() => {
    fetchSurveyClient();
  }, []);

  const handleSave = async () => {
    const mandatoryFields = {
      clientName: "Survey Client",
      dateOfInspection: "Inspection Date",
      nameOfIcd: "ICD Name",
      yardName: "Yard Name",
      inspectedBy: "Inspected By",
    };

    if (formData.nameOfIcd === "other") {
      mandatoryFields.customICD = "Custom Yard";
    }
    if (formData.yardName == "other") {
      mandatoryFields.customYard = "Custom Yard";
    }

    const emptyFields = Object.keys(mandatoryFields).filter(
      (field) => !formData[field]
    );

    if (emptyFields.length > 0) {
      const missingFieldsList = emptyFields
        .map((field) => mandatoryFields[field])
        .join(", ");
      toast.error(`PLEASE FILL THE MANDATORY FIELDS: ${missingFieldsList}`);

      const newErrors = {};
      emptyFields.forEach((field) => {
        newErrors[field] = `${mandatoryFields[field]} is required`;
      });
      setFormErrors(newErrors);

      return;
    }

    const inputDate = moment(formData.dateOfInspection, "DD-MM-YYYY");
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    if (!inputDate.isValid()) {
      toast.error("Invalid Date of Inspection");
      setFormErrors((prev) => ({
        ...prev,
        dateOfInspection: "Invalid Date",
      }));
      return;
    }
    if (inputDate.isAfter(current)) {
      toast.error("Inspection Date Cannot be in Future");
      setFormErrors((prev) => ({
        ...prev,
        dateOfInspection: "Date cannot be in future",
      }));
      return;
    }
    if (inputDate.isBefore(minimum)) {
      toast.error("Inspection Date cannot be more than 3 days in the past ");
      setFormErrors((prev) => ({
        ...prev,
        dateOfInspection: "Date cannot be more than 3 days in the past",
      }));
      return;
    }

    const formDataToSend = new FormData();

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => (value === "" ? null : value);

    const formattedDateOfInspection = moment(
      formData.dateOfInspection,
      "DD-MM-DDDD"
    ).format("YYYY-MM-DD");

    // Append all fields with proper null handling
    formDataToSend.append("containerNumber", formData.containerNumber || "");
    formDataToSend.append("client_name", toNullIfEmpty(formData.shippingLine));
    formDataToSend.append("size_type", toNullIfEmpty(formData.size));
    formDataToSend.append("tare_weight", toNullIfEmpty(formData.tareWeight));
    formDataToSend.append("mg_weight", toNullIfEmpty(formData.mgWeight));
    formDataToSend.append("mfd_date", toNullIfEmpty(formData.mfdDate));
    formDataToSend.append("csc_validity", toNullIfEmpty(formData.cscValidity));
    formDataToSend.append(
      "date_of_inspection",
      toNullIfEmpty(formattedDateOfInspection)
    );
    formDataToSend.append(
      "name_of_icd",
      toNullIfEmpty(
        formData.nameOfIcd === "other" ? formData.customICD : formData.nameOfIcd
      )
    );
    formDataToSend.append(
      "yard_name",
      toNullIfEmpty(
        formData.yardName === "other" ? formData.customYard : formData.yardName
      )
    );
    formDataToSend.append("inspected_by", toNullIfEmpty(formData.inspectedBy));
    formDataToSend.append(
      "container_condition",
      toNullIfEmpty(formData.containerRemarks)
    );
    formDataToSend.append("clientName", toNullIfEmpty(formData.clientName));
    formDataToSend.append("front_panel", toNullIfEmpty(formData.frontPanel));
    formDataToSend.append(
      "left_side_panel",
      toNullIfEmpty(formData.leftSidePanel)
    );
    formDataToSend.append(
      "right_side_panel",
      toNullIfEmpty(formData.rightSidePanel)
    );
    formDataToSend.append("floor", toNullIfEmpty(formData.floors));
    formDataToSend.append("roof_panel", toNullIfEmpty(formData.roof));
    formDataToSend.append("front_panel", toNullIfEmpty(formData.frontPanel));
    formDataToSend.append("door_panels", toNullIfEmpty(formData.door));
    formDataToSend.append(
      "internal_panels",
      toNullIfEmpty(formData.internalPanel)
    );
    formDataToSend.append(
      "under_structure",
      toNullIfEmpty(formData.underStructure)
    );

    // Append images
    images.forEach((image) => {
      formDataToSend.append("images", image.file);
    });

    try {
      const response = await operationService.emptyContainerInspection(
        formDataToSend
      );
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED EMPTY CONTAINER INSPECTION OPERATION FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${response.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving checklist");
      console.error("Error:", error);
    } finally {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Empty Container Inspection"
        parent="Apps"
        title="Empty Container Inspection"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange}
                forwarders={forwarders}
                forwardersLoading={false}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />

              <h5 className="mb-3 mt-5">Survey Client</h5>
              <Row className="mb-3">
                <Col md="6">
                  <Label className="mb-1 ">
                    Survey Client{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </Label>
                  <select
                    name="clientName"
                    id=""
                    className="form-select"
                    value={formData.clientName}
                    onChange={handleChange}
                  >
                    <option value="">Select Survey CLient</option>
                    {surveyClient.map((client) => {
                      return (
                        <option value={client.clientName}>
                          {client.clientName}
                        </option>
                      );
                    })}
                  </select>
                </Col>
              </Row>

              <div className="shadow-sm p-2 mt-3">
                <h5 className="mb-3 mt-5">
                  Empty Container Inspection Survey Details
                </h5>
                <Row className="mb-3 mt-2">
                  <Col md="6">
                    <label className="mb-1 ">
                      Date of Inspection{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="dateOfInspection"
                      type="text"
                      className={`form-control ${
                        formErrors.dateOfInspection ? "is-invalid" : ""
                      }`}
                      onChange={handleDateChange}
                      value={formData.dateOfInspection}
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="DD-MM-YYYY"
                    />
                    {formErrors.dateOfInspection && (
                      <div className="invalid-feedback">
                        {formErrors.dateOfInspection}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label className="form-label">
                      Inspected By{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      placeholder="Inspected By"
                      name="inspectedBy"
                      type="text"
                      className="form-control"
                      value={formData.inspectedBy}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-3 mt-4">
                  <Col md="6">
                    <label>
                      Name Of ICD{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="nameOfIcd"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.nameOfIcd}
                    >
                      <option value="">Select ICD</option>
                      {icds &&
                        icds.map((res) => {
                          return (
                            <option key={res.id} value={res.id}>
                              {res.name}
                            </option>
                          );
                        })}
                      <option value="other">Other</option>
                    </select>
                    {formData.nameOfIcd == "other" && (
                      <input
                        className="form-control mt-2"
                        name="customICD"
                        value={formData.customICD}
                        onChange={handleChange}
                        placeholder="Enter Custom ICD"
                      />
                    )}
                  </Col>

                  <Col md="6">
                    <label>
                      Yard Name{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="yardName"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.yardName}
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
                      <option value="other">Other</option>
                    </select>
                    {formData.yardName == "other" && (
                      <input
                        className="form-control mt-2"
                        name="customYard"
                        value={formData.customYard}
                        onChange={handleChange}
                        placeholder="Enter Custom Yard"
                      />
                    )}
                  </Col>
                </Row>
                <Row className="mb-3 mt-2">
                  <Col md="6">
                    <label className="form-label">Booking Number</label>
                    <input
                      placeholder="Booking Number"
                      name="bookingNumber"
                      type="text"
                      className="form-control"
                      value={formData.bookingNumber}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
              </div>

              <h5 className="mb-3 mt-4">Description of Part</h5>

              <Row className="mb-3">
                <Col md="4">
                  <SelectableInput
                    label="Right Side Panel"
                    name="rightSidePanel"
                    value={formData.rightSidePanel}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Left Side Panel"
                    name="leftSidePanel"
                    value={formData.leftSidePanel}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Front Panel"
                    name="frontPanel"
                    value={formData.frontPanel}
                    handleChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="4">
                  <SelectableInput
                    label="Door Panels"
                    name="door"
                    value={formData.door}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Roof Panel"
                    name="roof"
                    value={formData.roof}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Floor"
                    name="floors"
                    value={formData.floors}
                    handleChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6">
                  <SelectableInput
                    label="Internal Panels"
                    name="internalPanel"
                    value={formData.internalPanel}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="6">
                  <SelectableInput
                    label="Under Structure"
                    name="underStructure"
                    value={formData.underStructure}
                    handleChange={handleChange}
                    options={["not-sighted"]}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="12 mt-3">
                  <Label className="mb-1">
                    <b>Upload Inspection Images</b>
                  </Label>
                  <ImageUploadWithPreview
                    images={images}
                    setImages={setImages}
                  />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Container Condition</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Remarks</label>
                  <textarea
                    placeholder="Remarks"
                    name="containerRemarks"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.containerRemarks}
                  />
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

export default EmptyContainerInspection;
