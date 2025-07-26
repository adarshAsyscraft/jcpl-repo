import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, Label } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useDispatch, useSelector } from "react-redux";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import SelectableInput from "../Common/SelectableInput/selectableInput";
import ImageUploadWithPreview from "../Common/ImageUpload/ImageUpload";

const SocInspection = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { containerNumber } = useParams();
  const selectedOperation = location.state?.operation || "";
  const { icds } = useSelector((state) => state.icd);
  const yards = useSelector((state) => state.yards);
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);

  const { fetchedContainer } = useSelector((state) => state.container);
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );

  const [formData, setFormData] = useState({
    containerNumber: "",
    shippingLine: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    cscDate: "",
    operation: selectedOperation,
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    manufacturedBy: "",
    dateOfInspection: "",
    nameOfIcd: "",
    inspectedBy: "",
    cscPlateNo: "",
    rightSidePanel: "ok",
    leftSidePanel: "ok",
    frontPanel: "ok",
    door: "ok",
    roof: "ok",
    floors: "ok",
    internalPanel: "ok",
    underStructure: "not-sighted",
    customICD: "",
    customYard: "",
    remarks: "",
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

  useEffect(() => {
    if (fetchedContainer) {
      setFormData((prev) => ({
        ...prev,
        containerNumber: fetchedContainer.container_number || "",
        shippingLine: fetchedContainer.shipping_line_id || "",
        size: fetchedContainer.size || "",
        type: fetchedContainer.container_type || "",
        tareWeight: fetchedContainer.tare_weight || "",
        mgWeight: fetchedContainer.mg_weight || "",
        mfdDate: fetchedContainer.mfd_date || "",
        cscValidity: fetchedContainer.csc_validity || "",
      }));
    }
  }, [fetchedContainer]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name == "containerRemarks" || e.target.type == "text") {
      value = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    let isValidFormat = false;
    let inputDate;

    // Common format maps for moment
    const formatMap = {
      "-": "DD-MM-YYYY",
      "/": "DD/MM/YYYY",
      ".": "DD.MM.YYYY",
    };

    if (name === "dateOfInspection") {
      // Full validation: format + future/past check
      const match = value.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
      const separator = match?.[2];

      if (match && formatMap[separator]) {
        inputDate = moment(value, formatMap[separator], true);
        isValidFormat = inputDate.isValid();
      }

      const current = moment(currentDate, "DD-MM-YYYY");
      const minimum = moment(minAllowedDate, "DD-MM-YYYY");

      if (!value) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date is required",
        }));
      } else if (!isValidFormat) {
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
    } else if (name === "cscDate") {
      // Only format validation: MM-YYYY / MM/YYYY / MM.YYYY
      isValidFormat = /^(0[1-9]|1[0-2])[-/.]\d{4}$/.test(value);

      if (!value) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date is required",
        }));
      } else if (!isValidFormat) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date must be in MM-YYYY, MM/YYYY or MM.YYYY format",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  const handleSave = async () => {
    const formDataToSend = new FormData();

    const formattedDateOfInspection = moment(
      formData.dateOfInspection,
      "DD-MM-DDDD"
    ).format("YYYY-MM-DD");

    const formattedCcsDate = moment(formData.cscDate, "MM-YYYY").format(
      "YYYY-MM"
    );

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => (value === "" ? null : value);

    // Append all fields with proper null handling
    formDataToSend.append("containerNumber", formData.containerNumber || "");
    formDataToSend.append("client_name", toNullIfEmpty(formData.shippingLine));
    formDataToSend.append("size_type", toNullIfEmpty(formData.size));
    formDataToSend.append("tare_weight", toNullIfEmpty(formData.tareWeight));
    formDataToSend.append("mg_weight", toNullIfEmpty(formData.mgWeight));
    formDataToSend.append("mfd_date", toNullIfEmpty(formData.mfdDate));
    formDataToSend.append("csc_validity", toNullIfEmpty(formattedCcsDate));
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
    formDataToSend.append("cscDataPlateNo", toNullIfEmpty(formData.cscPlateNo));
    formDataToSend.append(
      "container_condition",
      toNullIfEmpty(formData.containerRemarks)
    );
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
    formDataToSend.append("door_panels", toNullIfEmpty(formData.door));
    formDataToSend.append(
      "under_structure",
      toNullIfEmpty(formData.underStructure)
    );

    // Append images
    images.forEach((image) => {
      formDataToSend.append("images", image.file);
    });

    try {
      const response = await operationService.socInspection(formDataToSend);
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED SEVEN-POINT CHECKLIST OPERATION FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${response.data.id}`
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
        mainTitle="SOC Inspection"
        parent="Apps"
        title="SOC Inspection"
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

              <h5 className="mb-3 mt-5">Inspection Details</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Date Of Inspection</label>
                  <input
                    name="dateOfInspection"
                    type="text"
                    placeholder="DD-MM-YYYY"
                    className={`form-control ${
                      errors.dateOfInspection ? "is-invalid" : ""
                    }`}
                    onChange={handleDateChange}
                    value={formData.dateOfInspection}
                  />
                  {errors?.dateOfInspection && (
                    <div className="invalid-feedback">
                      {errors.dateOfInspection}
                    </div>
                  )}
                </Col>
                <Col md="6">
                  <label className="form-label">Manufactured By</label>
                  <input
                    name="manufacturedBy"
                    placeholder="Manufactured By"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.manufacturedBy}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                {/* Name Of ICD */}
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

                {/* Yard Name */}
                <Col md="6">
                  <label>Yard Name</label>
                  <select
                    name="yardName"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.yardName}
                  >
                    <option value="">Select Yard</option>
                    {yards &&
                      yards.data &&
                      yards.data.map((res) => (
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
                <Col md="4">
                  <label className="form-label">Inspected By</label>
                  <input
                    name="inspectedBy"
                    placeholder="Inspected By"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.inspectedBy}
                  />
                </Col>
                <Col md="4">
                  <label className="form-label">CSC Validity</label>
                  <input
                    name="cscDate"
                    type="text"
                    placeholder="MM-YYYY"
                    className={`form-control ${
                      errors.cscDate ? "is-invalid" : ""
                    }`}
                    onChange={handleDateChange}
                    value={formData.cscDate}
                  />
                  {errors?.cscDate && (
                    <div className="invalid-feedback">{errors.cscDate}</div>
                  )}
                </Col>
                <Col md="4">
                  <label className="form-label">CSC Plate Number</label>
                  <input
                    name="cscPlateNo"
                    placeholder="CSC Plate Number"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.cscPlateNo}
                  />
                </Col>
              </Row>

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
                <Col md="12">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="containerRemarks"
                    placeholder="Remarks"
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

export default SocInspection;
