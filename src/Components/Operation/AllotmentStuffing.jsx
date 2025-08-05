import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchContainers } from "../../Redux/slices/containerSlice";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import ContainerDetailsSection from "./containerDetails";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { toast } from "react-toastify";
import operationService from "../../Services/operation";

const AllotmentStuffing = () => {
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { containerNumber } = useParams();
  const selectedOperation = location.state?.operation || "";
  const [formList, setFormList] = useState([]);
  const [previousPageData, setPreviousPageData] = useState({});
  const [gateInLoadStatus, setGateInLoadStatus] = useState(null);
  const [destuffDate, setDestuffDate] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);
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
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    cargoWeight: "",
    allotmentDate: "",
    allotmentType: "",
    cargoCategory: "",
    pdaAccount: "",
    aggrementParty: "",
    shipper: "",
    bookingNumber: "",
    dischargePortName: "",
    shipBillNumber: "",
    shipBillDate: "",
    fpd: "",
    packages: "",
    packedIn: "",
    vesselViaNumber: "",
    placeOfHandover: "",
    shipLine: "",
    custom: "",
    other: "",
    otherSealDescription: "",
    consigneeName: "",
    chaName: "",
    containerStatus: "",
    remarks: "",
    mainRemark: "",
    anyOtherRemarks: "",
    cargo: "",
    allotmentDeAllotmentDate: "",
    icdStuffing: "",
    imoNumber: "",
    unNumber: "",
    temperature: "",
  });
  const [errors, setErrors] = useState({
    allotmentDate: "",
    allotmentType: "",
    cargoCategory: "",
    pdaAccount: "",
  });

  const { fetchedContainer } = useSelector((state) => state.container);
  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const { data = [], loading: yardsLoading } = useSelector(
    (state) => state.yards || {}
  );

  //
  const allContainers = useSelector(
    (state) => state.container.allContainers || []
  );

  console.log("Al Containers::", allContainers);

  const filteredContainers = React.useMemo(() => {
    if (!formData.yardName) return [];
    return allContainers.filter(
      (container) => String(container.yard_id) === String(formData.yardName)
    );
  }, [formData.yardName, allContainers]);

  //

  useEffect(() => {
    const tare = Number(formData.tareWeight);
    const mg = Number(formData.mgWeight);
    const maxWeight = mg - tare;

    if (!isNaN(maxWeight) && formData.cargoWeight !== "") {
      if (Number(formData.cargoWeight) > maxWeight) {
        setErrors((prev) => ({
          ...prev,
          cargoWeight: `Cargo weight cannot exceed ${maxWeight} kg`,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          cargoWeight: formData.cargoWeight ? "" : "This field is required",
        }));
      }
    }
  }, [formData.cargoWeight, formData.mgWeight, formData.tareWeight]);

  const addForm = () => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        containerNumber: "",
        shipSealNo: "",
        remarks: "",
      },
    ]);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name == "mainRemark" ||
      name == "anyOtherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (
      name === "allotmentDate" ||
      name === "allotmentType" ||
      name === "cargoCategory" ||
      name === "pdaAccount"
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: value ? "" : "This field is required",
      }));
    }

    // New validation for cargo category dependent fields
    if (name === "cargoCategory") {
      const newErrors = { ...errors };

      if (value === "hazardous" || value === "both") {
        if (!formData.imoNumber) newErrors.imoNumber = "IMO Number is required";
        if (!formData.unNumber) newErrors.unNumber = "UN Number is required";
      }

      if (value === "refer" || value === "both") {
        if (!formData.temperature)
          newErrors.temperature = "Temperature is required";
      }

      setErrors(newErrors);
    }

    // Also validate dependent fields when they change
    if (name === "imoNumber" || name === "unNumber" || name === "temperature") {
      if (
        (formData.cargoCategory === "hazardous" ||
          formData.cargoCategory === "both") &&
        (name === "imoNumber" || name === "unNumber")
      ) {
        setErrors((prev) => ({
          ...prev,
          [name]: value ? "" : "This field is required",
        }));
      }

      if (
        (formData.cargoCategory === "refer" ||
          formData.cargoCategory === "both") &&
        name === "temperature"
      ) {
        setErrors((prev) => ({
          ...prev,
          [name]: value ? "" : "This field is required",
        }));
      }
    }

    if (name == "allotmentDate" && value > currentDate) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Allotment Date is not  greater than current date",
      }));
    }

    if (name === "cargoWeight") {
      const enteredWeight = Number(value);
      const tare = Number(formData.tareWeight);
      const mg = Number(formData.mgWeight);
      const maxAllowed = mg - tare;

      if (!isNaN(maxAllowed) && enteredWeight > maxAllowed) {
        setErrors((prev) => ({
          ...prev,
          cargoWeight: `Overload: Cargo weight cannot exceed ${maxAllowed} kg`,
        }));
      }
    }
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

  const handleSave = async () => {
    // Existing mandatory fields check
    const mandatoryFields = {
      allotmentDate: "Allotment Data",
      allotmentType: "Allotment Type",
      pdaAccount: "PDA Account",
      cargoCategory: "CargoCategory",
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

    // Enhanced Date Validation with toast messages
    const inputDate = moment(formData.allotmentDate, "DD-MM-YYYY", true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");
    const previous = moment(destuffDate, "YYYY-MM-DD");

    if (!inputDate.isValid()) {
      toast.error("Invalid date format for Allotment Date (DD-MM-YYYY)");
      setErrors((prev) => ({
        ...prev,
        allotmentDate: "Invalid date format (DD-MM-YYYY)",
      }));
      return;
    }

    if (inputDate.isAfter(current)) {
      toast.error("Allotment Date cannot be in the future");
      setErrors((prev) => ({
        ...prev,
        allotmentDate: "Date cannot be in the future",
      }));
      return;
    }

    if (inputDate.isBefore(minimum)) {
      toast.error("Allotment Date cannot be more than 3 days in the past");
      setErrors((prev) => ({
        ...prev,
        allotmentDate: "Date cannot be more than 3 days in the past",
      }));
      return;
    }

    if (inputDate.isBefore(previous)) {
      toast.error(`Allotment Date cannot be before ${lastOperation} date`);
      setErrors((prev) => ({
        ...prev,
        allotmentDate: `Date cannot be before ${lastOperation} date`,
      }));
      return;
    }

    const formattedAllotmentDate = moment(
      formData.allotmentDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const formattedShipBillDate = moment(
      formData.shipBillDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const payload = {
      containerNumber: fetchedContainer?.container_number || null,
      allotment_date: formattedAllotmentDate,
      allotment_type: formData.allotmentType,
      pda_account: formData.pdaAccount || null,
      agreement_party: formData.aggrementParty || null,
      shipper: formData.shipper || null,
      cargo_category: formData.cargoCategory,
      un_number: formData.unNumber || null,
      imo_number: formData.imoNumber || null,
      temperature: formData.temperature || null,
      booking_no: formData.bookingNumber || null,
      yard_id: formData.yardName || null,
      icd_stuffing: formData.icdStuffing || "ICD Location 1",
      discharge_port_name: formData.dischargePortName || null,
      fpd: formData.fpd || null,
      pol: formData.pol || null,
      shipp_bill_no: formData.shipBillNumber || null,
      s_bill_date: formattedShipBillDate,
      packages: parseInt(formData.packages) || null,
      packed_in: formData.packedIn || null,
      cargo: formData.cargo || null,
      cargo_wt_kgs: parseInt(formData.cargoWeight) || null,
      vessel_via_no: formData.vesselViaNumber || null,
      place_of_handover: formData.placeOfHandover || null,
      ship_line: formData.shipLine || null,
      custom: formData.custom || null,
      other: formData.other || null,
      other_seal_desc: formData.otherSealDescription || null,
      consignee_name: formData.consigneeName || null,
      cha_name: formData.chaName || null,
      remark: formData.mainRemark || null,
      // allotment_de_allotment_date: formData.allotmentDeAllotmentDate || null,
      containerStatus: formData.containerStatus || null,
      rows_data: formList || null,
      imo_number: formData.imoNumber || null,
      un_number: formData.unNumber || null,
      temperature: formData.temperature || null,
    };

    const response = await operationService.allotmentStuffing(payload);
    if (response.success) {
      // if (formData.allotmentType == "factory-stuffing") {
      localStorage.setItem("operation", 19);
      // }
      navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED ALLOTMENT STUFFING OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
      );
    }
  };

  const getInputType = (field) => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes("date")) return "date";
    return "text";
  };

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchYards());
    dispatch(fetchContainers());
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

  const getPreviousPageData = async () => {
    let response;
    let lastOP = localStorage.getItem("operation");
    try {
      if (lastOP == "10") {
        response = await operationService.getInDataFechByContainerNumber(
          containerNumber
        );
        setLastOperation("Gate In");
        setDestuffDate(response.data.inDate);
      } else if (lastOP == "4") {
        response = await operationService.destuffLclContainer(containerNumber);
        setLastOperation("Destuff Lcl");
        setDestuffDate(response.data.destuffDate);
      } else if (lastOP == "3") {
        response = await operationService.destuffFCLContainer(containerNumber);
        setLastOperation("Destuff Fcl");
        setDestuffDate(response.data.destuffDate);
      } else if (lastOP == "2") {
        response = await operationService.arrivalContainer(containerNumber);
        setLastOperation("Arrival");
        setDestuffDate(response.data.arraival_date);
      }

      if (response.success) {
        setPreviousPageData(response.data);

        setGateInLoadStatus(response.data.loadStatus);
        console.log("Load Status::", formData);
      }
    } catch (error) {
      console.log("error::", error);
    }
  };

  console.log("Previous Date::", destuffDate);

  useEffect(() => {
    getPreviousPageData();
  }, [containerNumber]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      yardName:
        previousPageData.yard ||
        previousPageData.yardId ||
        previousPageData.yard_id,
      containerStatus:
        previousPageData.containerStatus ||
        previousPageData.containerCondition ||
        previousPageData.container_condition ||
        previousPageData.container_status,
      mainRemark: previousPageData.remarks || "",
    }));
  }, [previousPageData]);

  useEffect(() => {
    if (previousPageData?.yard) {
      setFormData((prev) => ({
        ...prev,
        yardName: previousPageData.yard || null,
        containerStatus: previousPageData.containerStatus || null,
        mainRemark: previousPageData.remarks || "",
        // allotmentType: prev
      }));
    }
  }, [previousPageData]);

  useEffect(() => {
    if (gateInLoadStatus === "loaded") {
      setFormData((prev) => ({
        ...prev,
        allotmentType: "factory-stuffing",
      }));
    }
  }, [gateInLoadStatus]);

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

    // Improved date format validation
    const isValidFormat =
      /^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.]\d{4}$/.test(value);

    // Try parsing with multiple formats
    const formats = ["DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"];
    const inputDate = moment(value, formats, true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");
    const destuff = moment(destuffDate, "YYYY-MM-DD");
    console.log("Destuff Date::", destuff);

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date is required",
      }));
      return;
    }

    if (!isValidFormat || !inputDate.isValid()) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
      return;
    }

    // Specific validations for allotmentDate
    if (name === "allotmentDate") {
      if (inputDate.isBefore(minimum)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be more than 3 days in the past",
        }));
      } else if (inputDate.isBefore(destuff)) {
        setErrors((prev) => ({
          ...prev,
          [name]: `Allotment date cannot be before ${lastOperation} date`,
        }));
      } else if (inputDate.isAfter(current)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be in the future",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else {
      // For other dates (like shipBillDate), just validate format and basic rules
      if (inputDate.isAfter(current)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be in the future",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Allotment Stuffing"
        parent="Apps"
        title="Allotment Stuffing"
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
              <div className="shadow-sm p-4 mt-4 rounded">
                <Row className="mb-3 mt-5">
                  <Col md="4">
                    <label htmlFor="">
                      Allotment Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="allotmentDate"
                      type="text"
                      className={`form-control ${
                        errors.allotmentDate ? "is-invalid" : ""
                      }`}
                      value={formData.allotmentDate}
                      onChange={handleDateChange}
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="DD-MM-YYYY"
                      required
                    />
                    {errors.allotmentDate && (
                      <div className="invalid-feedback">
                        {errors.allotmentDate}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label htmlFor="">
                      Allotment Type{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="allotmentType"
                      className={`form-select ${
                        errors.allotmentType ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.allotmentType}
                      required
                    >
                      {gateInLoadStatus == "loaded" ? (
                        <option value="factory-stuffing">
                          Factory Stuffing
                        </option>
                      ) : (
                        <>
                          <option value="">Select Allotment Type</option>
                          <option value="icd-stuffing">ICD Stuffing</option>
                          <option value="factory-stuffing">
                            Factory Stuffing
                          </option>
                        </>
                      )}
                    </select>
                    {errors.allotmentType && (
                      <div className="invalid-feedback">
                        {errors.allotmentType}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label htmlFor="">
                      PDA Account{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="pdaAccount"
                      // className={`form-select form-control`}
                      className={`form-select ${
                        errors.pdaAccount ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.pdaAccount}
                      required
                    >
                      <option value="">Select PDA Account</option>
                      <option value="shipper pda">Shipper PDA</option>
                      <option value="liner pda">Liner PDA</option>
                    </select>
                    {errors.pdaAccount && (
                      <div className="invalid-feedback">
                        {errors.pdaAccount}
                      </div>
                    )}
                    {/* <input name="pdaAccount" type="text" className="form-control" placeholder="PDA Account" value={formData.pdaAccount} onChange={handleChange} /> */}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">Agreement Party</label>
                    <input
                      name="aggrementParty"
                      type="text"
                      className="form-control"
                      placeholder="Aggrement Party"
                      value={formData.aggrementParty}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Shipper</label>
                    <input
                      name="shipper"
                      type="text"
                      className="form-control"
                      placeholder="Shipper"
                      value={formData.shipper}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">
                      Cargo Category{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="cargoCategory"
                      className={`form-select ${
                        errors.cargoCategory ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.cargoCategory}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="hazardous">Hazardous</option>
                      <option value="non-hazardous">Non Hazardous</option>
                      <option value="refer">Refer</option>
                      <option value="both">Both</option>
                    </select>
                    {errors.cargoCategory && (
                      <div className="invalid-feedback">
                        {errors.cargoCategory}
                      </div>
                    )}
                  </Col>
                </Row>
                {(formData.cargoCategory === "hazardous" ||
                  formData.cargoCategory === "both") && (
                  <Row className="mb-3">
                    <Col md="6">
                      <label>IMO Number</label>
                      <input
                        name="imoNumber"
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        value={formData.imoNumber}
                      />
                    </Col>
                    <Col md="6">
                      <label>UN Number</label>
                      <input
                        name="unNumber"
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        value={formData.unNumber}
                      />
                    </Col>
                  </Row>
                )}

                {(formData.cargoCategory === "refer" ||
                  formData.cargoCategory === "both") && (
                  <Row className="mb-3">
                    <Col md="6">
                      <label>Temperature</label>
                      <input
                        name="temperature"
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        value={formData.temperature}
                      />
                    </Col>
                  </Row>
                )}

                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">Booking Number</label>
                    <input
                      name="bookingNumber"
                      type="text"
                      className="form-control"
                      placeholder="Booking Number"
                      value={formData.bookingNumber}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Discharge PORT Name</label>
                    <input
                      name="dischargePortName"
                      type="text"
                      className="form-control"
                      placeholder="Discharge Port Name(POD)"
                      value={formData.dischargePortName}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">FPD</label>
                    <input
                      name="fpd"
                      type="text"
                      className="form-control"
                      placeholder="FPD"
                      value={formData.fpd}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label>
                      Yard Name{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      disabled={
                        previousPageData.yard ||
                        previousPageData.yardId ||
                        previousPageData.yard_id
                      }
                      name="yardName"
                      onChange={handleChange}
                      value={formData.yardName}
                      className={`form-control`}
                    >
                      <option value="">Select Yard</option>
                      {yardsLoading ? (
                        <option>Loading...</option>
                      ) : (
                        data.map((yard) => (
                          <option key={yard.id} value={yard.id}>
                            {yard.name}
                          </option>
                        ))
                      )}
                    </select>
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Ship Bill Number</label>
                    <input
                      name="shipBillNumber"
                      type="text"
                      className="form-control"
                      placeholder="Ship Bill Number"
                      value={formData.shipBillNumber}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Ship Bill Date</label>
                    <input
                      name="shipBillDate"
                      type="text"
                      className={`form-control ${
                        errors.shipBillDate ? "is-invalid" : ""
                      }`}
                      placeholder="DD-MM-YYYY"
                      value={formData.shipBillDate}
                      onChange={handleDateChange}
                    />
                    {errors.shipBillDate && (
                      <div className="invalid-feedback">
                        {errors.shipBillDate}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">Cargo</label>
                    <input
                      name="cargo"
                      type="text"
                      className="form-control"
                      placeholder="Cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">POL</label>
                    <input
                      name="pol"
                      type="text"
                      className="form-control"
                      placeholder="POL"
                      value={formData.pol}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Packed In</label>
                    <input
                      name="packedIn"
                      type="text"
                      className="form-control"
                      placeholder="Packed In"
                      value={formData.packedIn}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">Packages</label>
                    <input
                      name="packages"
                      type="number"
                      className="form-control"
                      placeholder="Packages"
                      value={formData.packages}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Cargo Weight</label>
                    <input
                      name="cargoWeight"
                      type="number"
                      className={`form-control ${
                        errors.cargoWeight ? "is-invalid" : ""
                      }`}
                      placeholder="Cargo Weight (kgs)"
                      value={formData.cargoWeight}
                      onChange={handleChange}
                      required
                    />
                    {errors.cargoWeight && (
                      <div className="invalid-feedback">
                        {errors.cargoWeight}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label htmlFor="">Vessel Number</label>
                    <input
                      name="vesselViaNumber"
                      type="text"
                      className="form-control"
                      placeholder="Vessel/Via Number"
                      value={formData.vesselViaNumber}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">Place of Handover</label>
                    <input
                      name="placeOfHandover"
                      type="text"
                      className="form-control"
                      placeholder="Place of Handover"
                      value={formData.placeOfHandover}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <h5 className="mb-3 mt-4">Seal Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label htmlFor="">Shipline</label>
                    <input
                      name="shipLine"
                      type="text"
                      className="form-control"
                      placeholder="ShipLine"
                      onChange={handleChange}
                      value={formData.shipLine}
                    />
                  </Col>
                  <Col md="6">
                    <label htmlFor="">Custom</label>
                    <input
                      name="custom"
                      type="text"
                      className="form-control"
                      placeholder="Custom"
                      onChange={handleChange}
                      value={formData.custom}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label htmlFor="">Other</label>
                    <input
                      name="other"
                      type="text"
                      className="form-control"
                      placeholder="Other"
                      onChange={handleChange}
                      value={formData.other}
                    />
                  </Col>
                  <Col md="6">
                    <label htmlFor="">Other Seal Description</label>
                    <input
                      name="otherSealDescription"
                      type="text"
                      className="form-control"
                      placeholder="Other Seal Description"
                      onChange={handleChange}
                      value={formData.otherSealDescription}
                    />
                  </Col>
                </Row>
                <h5 className="mb-3 mt-4">Consignee Name & CHA</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label htmlFor="">Consignee Name</label>
                    <input
                      name="consigneeName"
                      className="form-control"
                      placeholder="Consignee Name"
                      onChange={handleChange}
                      value={formData.consigneeName}
                    />
                  </Col>
                  <Col md="6">
                    <label htmlFor="">CHA Name</label>
                    <input
                      name="chaName"
                      className="form-control"
                      placeholder="chaName"
                      onChange={handleChange}
                      value={formData.chaName}
                    />
                  </Col>
                </Row>
              </div>
              <div className="shadow-sm p-4 mt-4 rounded">
                <h5 className="mb-3 mt-4">Container Condition</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Container Status</label>
                    <select
                      name="containerStatus"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.containerStatus}
                    >
                      <option value="">Select Container Status</option>
                      <option value="Sound">Sound</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label htmlFor="">Remarks</label>
                    <textarea
                      name="mainRemark"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.mainRemark}
                      placeholder="Remarks"
                    ></textarea>
                  </Col>
                  <Col md="6">
                    <label htmlFor="">Any Other Remarks</label>
                    <textarea
                      name="anyOtherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.anyOtherRemarks}
                      placeholder="Any Other Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 mt-4 rounded">
                <div className="mb-3">
                  <button className="btn btn-primary w-25" onClick={addForm}>
                    Add Rows
                  </button>

                  {formList.map((form, index) => (
                    <div key={form.id} className="mt-4 p-4 border rounded ">
                      <div className="row">
                        {Object.keys(form).map((field) => (
                          <div key={field} className="col-md-4 mb-2">
                            <label className="form-label">{field}</label>
                            {/* {field === "containerNumber" ? (
                              <select
                                className="form-select"
                                value={form[field]}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    field,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Container</option>
                                {filteredContainers.map((container) => (
                                  <option
                                    key={container.id}
                                    value={container.container_number}
                                  >
                                    {container.container_number}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={getInputType(field)}
                                value={form[field]}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    field,
                                    e.target.value
                                  )
                                }
                                className="form-control"
                              />
                            )} */}

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
              </div>
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

export default AllotmentStuffing;
