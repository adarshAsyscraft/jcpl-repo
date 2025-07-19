import React, { Fragment, useContext, useEffect, useState } from "react";
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
  const [formErrors, setFormErrors] = useState({});
  const { data: forwarders = [] } = useSelector(
    (state) => state.forwarders || {}
  );
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");

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
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    dateOfInspection: "",
    nameOfIcd: "",
    inspectedBy: "",
    remarks: fetchedContainer?.remarks || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    const payload = {
      containerNumber: formData.containerNumber || "",
      client_name: formData.client_name || "", //
      size_type: "20ft Standard", //
      tare_weight: formData.tareWeight || "",
      mg_weight: formData.mfdDate || "",
      mfd_date: formData.mfdDate || "",
      csc_validity: formData.cscValidity || "",
      manufactured_by: formData?.manufactured_by || 1, //
      date_of_inspection:
        moment(formData.dateOfInspection, "DD-MM-YYYY").format("YYYY-MM-DD") ||
        "",
      name_of_icd: formData.nameOfIcd || "",
      yard_name: formData.yardName || "",
      inspected_by: parseInt(formData.inspectedBy) || "",
      container_condition: formData.containerCondition || "Good",
    };

    const response = await operationService.sevenPointCheckList(payload);
    if (response.success) {
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED 7 POINT CHECK LIST OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
      );
      navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
    }
  };

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchICDs());
    dispatch(fetchYards());
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
                    placeholder="Arrival date"
                  />
                  {formErrors.dateOfInspection && (
                    <div className="invalid-feedback">
                      {formErrors.dateOfInspection}
                    </div>
                  )}
                </Col>
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
                      icds.map((res) => {
                        return (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        );
                      })}
                  </select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>Yard Name</label>
                  <select
                    name="nameOfYard"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.nameOfYard}
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
                <Col md="6">
                  <Label className="mb-1 ">Inspected By</Label>
                  <input
                    name="inspectedBy"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.inspectedBy}
                  />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Container Condition</h5>

              <Row className="mb-3">
                <Col md="6">
                  <Label className="mb-1 ">Remarks</Label>
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
