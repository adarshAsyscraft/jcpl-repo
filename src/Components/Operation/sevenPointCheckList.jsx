import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, Label } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import ContainerDetailsSection from "./containerDetails";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";
import ImageUploadWithPreview from "../Common/ImageUpload/ImageUpload";
import SelectableInput from "../Common/SelectableInput/selectableInput";

const SevenPointCheckList = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { containerNumber } = useParams();
  const dispatch = useDispatch();
  const selectedOperation = location.state?.operation || "";
  const { fetchedContainer } = useSelector((state) => state.container);
  const { icds } = useSelector((state) => state.icd);
  const yards = useSelector((state) => state.yards);
  const { data: forwarders = [] } = useSelector(
    (state) => state.forwarders || {}
  );
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    containerNumber: fetchedContainer?.container_number || "",
    shippingLine: fetchedContainer?.shipping_line_id || "",
    size: fetchedContainer?.size || "",
    type: fetchedContainer?.container_type || "",
    tareWeight: fetchedContainer?.tare_weight || "",
    mgWeight: fetchedContainer?.mg_weight || "",
    mfdDate: fetchedContainer?.mfd_date || "",
    cscValidity: fetchedContainer?.csc_validity || "",
    operation: selectedOperation,
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    yardName: "",
    customYard: "",
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    dateOfInspection: "",
    nameOfIcd: "",
    customICD: "",
    inspectedBy: "",
    frontWall: "ok",
    leftSideWall: "ok",
    rightSideWall: "ok",
    floor: "ok",
    roof: "ok",
    doors: "ok",
    outSide: "not-sighted",
    containerRemark:
      "CONTAINER INSPECTED IN STACK AND FIT FOR STUFFING SUBJECT TO PROPER CLEANING",
    bookingNo: "",
  });

  console.log("Fetched COntainer::", fetchedContainer);

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name == "containerRemark" || e.target.type == "text") {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = async (e) => {
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

  const handleSave = async () => {
    const formDataToSend = new FormData();

    // Helper function to convert empty strings to null
    const toNullIfEmpty = (value) => (value === "" ? null : value);
    const formattedDateOfInspection = moment(
      formData.dateOfInspection,
      "DD-MM-YYYY"
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
      "manufactured_by",
      toNullIfEmpty(formData.transportMode)
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
    formDataToSend.append("booking_no", toNullIfEmpty(formData.bookingNo));
    formDataToSend.append(
      "yard_name",
      toNullIfEmpty(
        formData.yardName === "other" ? formData.customYard : formData.yardName
      )
    );
    formDataToSend.append("inspected_by", toNullIfEmpty(formData.inspectedBy));
    formDataToSend.append(
      "container_condition",
      toNullIfEmpty(formData.containerRemark)
    );
    formDataToSend.append("front_panel", toNullIfEmpty(formData.frontWall));
    formDataToSend.append(
      "left_side_panel",
      toNullIfEmpty(formData.leftSideWall)
    );
    formDataToSend.append(
      "right_side_panel",
      toNullIfEmpty(formData.rightSideWall)
    );
    formDataToSend.append("floor", toNullIfEmpty(formData.floor));
    formDataToSend.append("roof_panel", toNullIfEmpty(formData.roof));
    formDataToSend.append("door_panels", toNullIfEmpty(formData.doors));
    formDataToSend.append("under_structure", toNullIfEmpty(formData.outSide));

    // Append images
    images.forEach((image) => {
      formDataToSend.append("images", image.file);
    });

    console.log("FormData::", formData);

    try {
      const response = await operationService.sevenPointCheckList(
        formDataToSend
      );
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED SEVEN-POINT CHECKLIST OPERATION FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${response.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
      }
      console.log("Payload::", formDataToSend);
    } catch (error) {
      console.log("Payload::", formDataToSend);
      toast.error(error.response?.data?.message || "Error saving checklist");
      console.error("Error:", error);
    } finally {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    }
  };

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchICDs());
    dispatch(fetchYards());

    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="7 Point CheckList"
        parent="Apps"
        title="7 Point CheckList"
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

              <h5 className="mb-3 mt-5">Inspection Details</h5>

              <Row className="mb-3">
                <Col md="6">
                  <Label className="mb-1 ">Date of Inspection</Label>
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
                  <Label className="mb-1">Name Of ICD</Label>
                  <select
                    name="nameOfIcd"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.nameOfIcd}
                  >
                    <option value="">Select ICD</option>
                    {icds &&
                      icds.map((res) => (
                        <>
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        </>
                      ))}
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
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <Label className="mb-1">Yard Name</Label>
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
                <Col md="6">
                  <Label className="mb-1">Inspected By</Label>
                  <input
                    name="inspectedBy"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.inspectedBy}
                    placeholder="Inspected By*"
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6">
                  <Label className="mb-1">Booking Number</Label>
                  <input
                    className="form-control"
                    name="bookingNo"
                    value={formData.bookingNo}
                    onChange={handleChange}
                    placeholder="Booking Number *"
                  />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">
                Inspection Point As Per 7-Point Check
              </h5>

              <Row className="mb-3">
                <Col md="4">
                  <SelectableInput
                    label="Front Wall"
                    name="frontWall"
                    value={formData.frontWall}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Left Side Wall"
                    name="leftSideWall"
                    value={formData.leftSideWall}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Right Side Wall"
                    name="rightSideWall"
                    value={formData.rightSideWall}
                    handleChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="4">
                  <SelectableInput
                    label="Floor"
                    name="floor"
                    value={formData.floor}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Roof"
                    name="roof"
                    value={formData.roof}
                    handleChange={handleChange}
                  />
                </Col>
                <Col md="4">
                  <SelectableInput
                    label="Doors"
                    name="doors"
                    value={formData.doors}
                    handleChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="6">
                  <SelectableInput
                    label="Outside/UNDERCARRIAGE"
                    name="outSide"
                    // options={["not-sighted"]}
                    value={formData.outSide}
                    handleChange={handleChange}
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

              <Row className="mb-3">
                <Col md="12">
                  <Label className="mb-1">Remarks</Label>
                  <textarea
                    name="containerRemark"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.containerRemark}
                    placeholder="Remarks"
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

export default SevenPointCheckList;
