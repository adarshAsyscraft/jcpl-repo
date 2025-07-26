import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Label, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpectedContainer } from "../../Redux/slices/expectedArrivalSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import ContainerDetailsSection from "./containerDetails";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import moment from "moment";
import SelectableInput from "../Common/SelectableInput/selectableInput";
import ImageUploadWithPreview from "../Common/ImageUpload/ImageUpload";
import operationService from "../../Services/operation";

const OnHireSurvey = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const containerData = location.state || "";
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);

  const selectedOperation = location.state?.operation || "1";

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
  }, []);

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchICDs());
  }, [dispatch]);

  const { fetchedContainer } = useSelector((state) => state.container);
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
  const { icds } = useSelector((state) => state.icd);
  const yards = useSelector((state) => state.yards);
  const [formData, setFormData] = useState({
    containerNumber: fetchedContainer.container_number,
    shippingLineId: fetchedContainer?.shipping_line_id,
    size: fetchedContainer.size,
    type: fetchedContainer.type,
    tareWeight: fetchedContainer.tare_weight,
    mgWeight: fetchedContainer.mg_weight,
    mfdDate: fetchedContainer.mfd_date,
    cscValidity: fetchedContainer.csc_validity,
    remarks: fetchedContainer.remarks,
    operation: selectedOperation || "",
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    otherRemarks: "",
    loadStatus: "",
    manufacturedBy: "",
    inspectionDate: "",
    nameOfIcd: "",
    inspectedBy: "",
    rightSidePanel: {
      condition: "ok",
      existingRepair: "",
    },
    leftSidePanel: {
      condition: "ok",
      existingRepair: "",
    },
    frontPanel: {
      condition: "ok",
      existingRepair: "",
    },
    door: {
      condition: "ok",
      existingRepair: "",
    },
    roof: {
      condition: "ok",
      existingRepair: "",
    },
    floors: {
      condition: "ok",
      existingRepair: "",
    },
    internalPanel: {
      condition: "ok",
      existingRepair: "",
    },
    underStructure: {
      condition: "not-sighted",
      existingRepair: "",
    },
    customICD: "",
    customYard: "",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (e.target.type === "text") {
      value = value.toUpperCase();
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    const formDataToSend = new FormData();

    const formattedDateOfInspection = moment(
      formData.inspectionDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const toNullIfEmpty = (value) => (value === "" ? null : value);
    console.log("Form Data before sending:", formData);

    // Flat fields
    formDataToSend.append("containerNumber", formData.containerNumber);
    formDataToSend.append("size_type", toNullIfEmpty(formData.size));
    formDataToSend.append("tare_weight", toNullIfEmpty(formData.tareWeight));
    formDataToSend.append("mg_weight", toNullIfEmpty(formData.mgWeight));
    formDataToSend.append("mfd_date", toNullIfEmpty(formData.mfdDate));
    formDataToSend.append("csc_validity", toNullIfEmpty(formData.cscValidity));
    formDataToSend.append(
      "manufactured_by",
      toNullIfEmpty(formData.manufacturedBy)
    );
    formDataToSend.append(
      "date_of_inspection",
      toNullIfEmpty(formattedDateOfInspection)
    );
    formDataToSend.append(
      "name_of_icd",
      formData.nameOfIcd === "other"
        ? toNullIfEmpty(formData.customICD)
        : toNullIfEmpty(formData.nameOfIcd)
    );
    formDataToSend.append(
      "yard_name",
      formData.yardName === "other"
        ? toNullIfEmpty(formData.customYard)
        : toNullIfEmpty(formData.yardName)
    );
    formDataToSend.append("inspected_by", toNullIfEmpty(formData.inspectedBy));
    formDataToSend.append(
      "container_condition",
      toNullIfEmpty(formData.remarks)
    );

    // Helper to convert part object to backend format
    const mapPanel = (panel) =>
      JSON.stringify({
        status: panel?.condition || "",
        remarks: panel?.existingRepair || "",
      });

    // Nested panel fields as JSON
    formDataToSend.append(
      "right_side_panel",
      mapPanel(formData.rightSidePanel)
    );
    formDataToSend.append("left_side_panel", mapPanel(formData.leftSidePanel));
    formDataToSend.append("front_panel", mapPanel(formData.frontPanel));
    formDataToSend.append("door_panels", mapPanel(formData.door));
    formDataToSend.append("roof_panel", mapPanel(formData.roof));
    formDataToSend.append("floor", mapPanel(formData.floors));
    formDataToSend.append("internal_panel", mapPanel(formData.internalPanel));

    // Under structure (expected as plain string description)
    formDataToSend.append("under_structure", mapPanel(formData.underStructure));

    // Append image files
    images.forEach((image) => {
      formDataToSend.append("images", image.file);
    });

    console.log("Payload::", formDataToSend);

    try {
      const response = await operationService.onHireSurvey(formDataToSend);
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED ON HIRE SURVEY OPERATION FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${response.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving checklist");
      console.error("Error saving on hire survey operation:", error);
    } finally {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="On Hire Survey of Container"
        parent="Apps"
        title="On Hire Survey of Container"
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

              <div className="shadow-sm p-4 mt-4">
                <h5 className="mb-3 mt-5">On Hire Survey Details</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Inspection Date</label>
                    <input
                      name="inspectionDate"
                      type="text"
                      placeholder="DD-MM-YYYY"
                      className={`form-control ${
                        errors.inspectionDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDateChange}
                      value={formData.inspectionDate}
                    />
                    {errors?.inspectionDate && (
                      <div className="invalid-feedback">
                        {errors.inspectionDate}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label>Manufactured By</label>
                    <input
                      name="manufacturedBy"
                      type="text"
                      placeholder="Manufactured By"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.manufacturedBy}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>Name Of ICD</label>
                    <select
                      name="nameOfIcd"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.nameOfIcd}
                    >
                      <option value="">Select ICD</option>
                      {icds &&
                        icds.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        ))}
                      <option value="other">Other</option>
                    </select>
                    {formData.nameOfIcd === "other" && (
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
                    <label>Yard Name</label>
                    <select
                      name="yardName"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.yardName}
                    >
                      <option value="">Select Yard</option>
                      {yards?.data?.map((res) => (
                        <option key={res.id} value={res.id}>
                          {res.name}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    {formData.yardName === "other" && (
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

                <Row className="mb-3">
                  <Col md="6">
                    <label>Inspected By</label>
                    <input
                      name="inspectedBy"
                      type="text"
                      placeholder="Inspected By"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.inspectedBy}
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
                  {formData.rightSidePanel.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="rightSidePanel.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.rightSidePanel.existingRepair}
                    />
                  )}
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Left Side Panel"
                    name="leftSidePanel"
                    value={formData.leftSidePanel}
                    handleChange={handleChange}
                  />
                  {formData.leftSidePanel.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="leftSidePanel.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.leftSidePanel.existingRepair}
                    />
                  )}
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Front Panel"
                    name="frontPanel"
                    value={formData.frontPanel}
                    handleChange={handleChange}
                  />
                  {formData.frontPanel.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="frontPanel.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.frontPanel.existingRepair}
                    />
                  )}
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
                  {formData.door.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="door.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.door.existingRepair}
                    />
                  )}
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Roof Panel"
                    name="roof"
                    value={formData.roof}
                    handleChange={handleChange}
                  />
                  {formData.roof.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="roof.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.roof.existingRepair}
                    />
                  )}
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Floor"
                    name="floors"
                    value={formData.floors}
                    handleChange={handleChange}
                  />
                  {formData.floors.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="floors.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.floors.existingRepair}
                    />
                  )}
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
                  {formData.internalPanel.condition == "ok" && (
                    <input
                      type="text"
                      className="form-control"
                      name="internalPanel.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.internalPanel.existingRepair}
                    />
                  )}
                </Col>
                <Col md="6">
                  <SelectableInput
                    label="Under Structure"
                    name="underStructure"
                    value={formData.underStructure}
                    handleChange={handleChange}
                  />
                  {formData.underStructure.condition == "not-sighted" && (
                    <input
                      type="text"
                      className="form-control"
                      name="underStructure.existingRepair"
                      placeholder="Existing Repair"
                      onChange={handleChange}
                      value={formData.underStructure.existingRepair}
                    />
                  )}
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

export default OnHireSurvey;
