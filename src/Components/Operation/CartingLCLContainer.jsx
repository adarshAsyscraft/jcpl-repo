import React, {
  Fragment,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, FormGroup, Label, Input } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useSelector, useDispatch } from "react-redux";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import moment from "moment";
import { toast } from "react-toastify";
import { fetchYards } from "../../Redux/slices/yardSlice";
import DynamicForm from "./cartingDynamicField";
import operationService from "../../Services/operation";
import { fetchICDs } from "../../Redux/slices/icdsSlice";

const CartingLCLContainer = () => {
  const dispatch = useDispatch();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [packageMismatchError, setPackageMismatchError] = useState("");

  const navigate = useNavigate();
  const {
    data = [],
    loading: yardsLoading,
    error: yardsError,
  } = useSelector((state) => state.yards || {});
  const [errors, setErrors] = useState({
    cartingDate: "",
    shippingForwarderLine: "",
    shipBillNumber: "",
    shipBillDate: "",
    netWeight: "",
    commencingDateTime: "",
    completionDateTime: "",
  });

  const containerNumber = location.state?.containerNumber || "";
  const selectedOperation = location.state?.operation || "";
  const { data: forwarders = [] } = useSelector(
    (state) => state.forwarders || {}
  );
  const { icds, loading } = useSelector((state) => state.icd);

  const [ctmList, setCtmList] = useState([
    {
      id: Date.now(),
      recievedCTM: "",
      length: "",
      breadth: "",
      height: "",
      total: 0,
    },
  ]);
  const [cbm, setCbm] = useState(0);
  const [totalPackages, setTotalPackages] = useState("0");
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [disableFields, setDisableFields] = useState(true);
  const [enableCBM, setEnableCBM] = useState(false);

  const [formData, setFormData] = useState({
    containerNumber,
    shippingLine: "",
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
    ready: "Not Ready",
    cbm: "0.000",
    cartingDate: "",
    shipBillNumber: "",
    shipBillDate: "",
    shippingForwarderLine: "",
    shipper: "",
    icdDfs: "",
    sku: "",
    number: "",
    cargoCondition: "ok",
    commencingDateTime: "",
    completionDateTime: "",
    getInDateTime: "",
    reportDateTime: "",
    truckNumber: "",
    hsCode: "",
    ispm: "",
    readyDate: "",
    style: "",
    locationOfCargo: "",
    marks: "",
    packedIn: "",
    packages: "",
    cargoWeight: "",
    cargo: "",
    fpd: "",
    pod: "",
    invoiceDate: "",
    poNumber: "",
    consignee: "",
    clearingAgent: "",
    cartingNumber: "",
    remarks: "",
    yardId: "",
    netWeight: "",
    invoiceNumber: "",
    aggrementParty: "",
    ispmNumber: "",
    shipperCbm: "",
  });

  const addMoreCTM = () => {
    setCtmList((prev) => [
      ...prev,
      {
        id: Date.now(),
        recievedCTM: "",
        length: "",
        breadth: "",
        height: "",
        total: 0,
      },
    ]);
  };

  useEffect(() => {
    if (
      formData.packages &&
      totalPackages &&
      formData.packages !== totalPackages.toString()
    ) {
      setPackageMismatchError(
        `Mismatch: Entered ${formData.packages} packages, but calculated ${totalPackages}`
      );
    } else {
      setPackageMismatchError("");
    }
  }, [formData.packages, totalPackages]);

  useEffect(() => {
    const containerNumber = location.state?.containerNumber || "";
    if (containerNumber) {
      dispatch(fetchContainerByNumber(containerNumber));
    }
    dispatch(fetchForwarders());
  }, [dispatch, location.state]);

  useEffect(() => {
    dispatch(fetchICDs());
  }, [dispatch]);

  const handleCTMChange = (index, field, value) => {
    const updatedList = [...ctmList];
    updatedList[index][field] = value;

    const { recievedCTM, length, breadth, height } = updatedList[index];
    if (length && breadth && height) {
      setEnableCBM(true);
    } else {
      setEnableCBM(false);
    }

    const total =
      (parseFloat(recievedCTM || 0) *
        parseFloat(length || 0) *
        parseFloat(breadth || 0) *
        parseFloat(height || 0)) /
      1000000;

    updatedList[index].total = total.toFixed(3);
    setCtmList(updatedList);

    const totalCBM = updatedList.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
    const totalPackage = updatedList.reduce(
      (sum, item) => sum + parseFloat(item.recievedCTM || 0),
      0
    );
    setCbm(totalCBM.toFixed(3));
    setTotalPackages(totalPackage);

    setFormData((prev) => ({ ...prev, cbm: totalCBM.toFixed(3) }));
  };

  const removeCTMRow = (index) => {
    const updatedList = ctmList.filter((_, i) => i !== index);
    setCtmList(updatedList);

    const totalCBM = updatedList.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
    const totalPackage = updatedList.reduce(
      (sum, item) => sum + parseFloat(item.recievedCTM || 0),
      0
    );
    setCbm(totalCBM.toFixed(3));
    setTotalPackages(totalPackage.toFixed(3));
    setFormData((prev) => ({ ...prev, cbm: totalCBM.toFixed(3) }));
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "text") {
      value = value.toUpperCase();
    }

    if (name === "cbm" && value !== "") {
      setCbm(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    const requiredFields = {
      shippingForwarderLine:
        "shippingForwarderLine is required for hazardous cargo",
      shipBillNumber: "shipBillNumber is required for hazardous cargo",
      shipBillDate: "shipBillDate is required for hazardous cargo",
    };

    if (
      name === "netWeight" &&
      parseFloat(value) > parseFloat(formData.cargoWeight)
    ) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        netWeight: "Net weight should not be greater than cargo weight",
      }));
    } else if (name === "netWeight") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        netWeight: "",
      }));
    }

    if (requiredFields[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: value ? "" : requiredFields[name],
      }));
    }
  };

  const handleBlur = (e) => {
    if (e.target.name === "shipperCbm" && e.target.value !== "") {
      const newVal = parseFloat(e.target.value);

      if (!isNaN(newVal) && cbm) {
        const difVal = Math.abs(newVal - cbm);
        const percentage = (difVal / cbm) * 100;

        // ✅ Show message only if difference > 5%
        if (percentage > 5) {
          if (newVal < cbm) {
            toast.warning(
              `JASMAN CBM DIFFERENCE IS MORE THAN ${difVal} and ${percentage.toFixed(
                2
              )}%. KINDLY RE-CHECK WITH WAREHOUSE TEAM`
            );
          } else {
            toast.error(
              `KINDLY RECHECK SHIPPER CBM IS LESS BY ${difVal} and ${percentage.toFixed(
                2
              )}%`
            );
          }
        }
      }
    }
  };

  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;

    // Remove non-digit characters
    let digits = value.replace(/\D/g, "").substring(0, 12); // Allow only max 12 digits
    const current = moment(currentDate, "DD-MM-YYYY HH:mm:ss");

    // Format progressively: DD-MM-YYYY HH:MM
    let formatted = "";
    if (digits.length >= 1) formatted += digits.slice(0, 2); // DD
    if (digits.length >= 3)
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}`; // -MM
    if (digits.length >= 5)
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(
        4,
        8
      )}`; // -YYYY
    if (digits.length >= 9)
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(
        4,
        8
      )} ${digits.slice(8, 10)}`; // HH
    if (digits.length >= 11)
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(
        4,
        8
      )} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`; // :MM

    // Update input
    setFormData((prev) => ({
      ...prev,
      [name]: formatted,
    }));

    // Only validate when 12 digits are entered
    if (digits.length === 12) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      const hours = digits.slice(8, 10);
      const minutes = digits.slice(10, 12);

      const dateValid = moment(
        `${year}-${month}-${day}`,
        "YYYY-MM-DD",
        true
      ).isValid();
      const timeValid = parseInt(hours) < 24 && parseInt(minutes) < 60;

      setErrors((prev) => ({
        ...prev,
        [name]: dateValid && timeValid ? "" : "Invalid date or time",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSave = async () => {
    const mandatoryFields = {
      cartingDate: "Carting Date",
      shippingForwarderLine: "Shipping/Forwarder Line",
      icdDfs: "ICD Name",
      yardId: "Yard Name",
    };

    // Check mandatory fields
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
      setErrors(newErrors);
      return;
    }

    // DATE VALIDATIONS
    const inputDate = moment(formData.cartingDate, "DD-MM-YYYY", true);
    const shipBillDate = moment(formData.shipBillDate, "DD-MM-YYYY", true);
    const invoiceDate = moment(formData.invoiceDate, "DD-MM-YYYY", true);
    const readyDate = moment(formData.readyDate, "DD-MM-YYYY", true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");
    const commencingDateTime = moment(
      formData.commencingDateTime,
      "DD-MM-YYYY HH:mm",
      true
    );
    const completionDateTime = moment(
      formData.completionDateTime,
      "DD-MM-YYYY HH:mm",
      true
    );

    if (!inputDate.isValid()) {
      toast.error("Invalid format for Carting Date");
      setErrors((prev) => ({
        ...prev,
        cartingDate: "Invalid date format (DD-MM-YYYY)",
      }));
      return;
    }

    if (formData.shipBillDate) {
      if (!shipBillDate.isValid()) {
        toast.error("Invalid format for Ship Bill Date");
        setErrors((prev) => ({
          ...prev,
          shipBillDate: "Invalid date format (DD-MM-YYYY)",
        }));
        return;
      }
      if (shipBillDate.isAfter(current)) {
        toast.error("Ship Bill Date cannot be in future");
        setErrors((prev) => ({
          ...prev,
          shipBillDate: "Ship Bill Date cannot be in future",
        }));
        return;
      }
    }

    if (formData.invoiceDate) {
      if (!invoiceDate.isValid()) {
        toast.error("Invalid format for Invoice Date");
        setErrors((prev) => ({
          ...prev,
          invoiceDate: "Invalid date format (DD-MM-YYYY)",
        }));
        return;
      }
      if (invoiceDate.isAfter(current)) {
        toast.error("Invoice Date cannot be in future");
        setErrors((prev) => ({
          ...prev,
          invoiceDate: "Invoice Date cannot be in future",
        }));
        return;
      }
    }

    if (formData.commencingDateTime) {
      if (!commencingDateTime.isValid()) {
        toast.error("Invalid format for Commencing Date & Time");
        setErrors((prev) => ({
          ...prev,
          commencingDateTime: "Invalid format (DD-MM-YYYY HH:mm)",
        }));
        return;
      }
      if (commencingDateTime.isAfter(moment())) {
        toast.error("Commencing Date cannot be in future");
        setErrors((prev) => ({
          ...prev,
          commencingDateTime: "Date cannot be in future",
        }));
        return;
      }
    }

    if (formData.completionDateTime) {
      if (!completionDateTime.isValid()) {
        toast.error("Invalid format for Completion Date & Time");
        setErrors((prev) => ({
          ...prev,
          completionDateTime: "Invalid format (DD-MM-YYYY HH:mm)",
        }));
        return;
      }
      if (completionDateTime.isAfter(moment())) {
        toast.error("Completion Date cannot be in future");
        setErrors((prev) => ({
          ...prev,
          completionDateTime: "Date cannot be in future",
        }));
        return;
      }
    }

    if (formData.readyDate) {
      if (!readyDate.isValid()) {
        toast.error("Invalid format for Ready Date");
        setErrors((prev) => ({
          ...prev,
          readyDate: "Invalid format (DD-MM-YYYY)",
        }));
        return;
      }
      if (readyDate.isAfter(current)) {
        toast.error("Ready Date cannot be in future");
        setErrors((prev) => ({
          ...prev,
          readyDate: "Date cannot be in future",
        }));
        return;
      }
    }

    if (inputDate.isBefore(minimum)) {
      toast.error("Carting Date cannot be more than 3 days in the past.");
      setErrors((prev) => ({
        ...prev,
        cartingDate: "Carting Date cannot be more than 3 days in the past.",
      }));
      return;
    }

    if (inputDate.isAfter(current)) {
      toast.error("Carting Date cannot be in future");
      setErrors((prev) => ({
        ...prev,
        cartingDate: "Carting Date cannot be in future",
      }));
      return;
    }

    // NET WEIGHT CHECK
    if (parseFloat(formData.netWeight) > parseFloat(formData.cargoWeight)) {
      toast.error("Net weight should not be greater than cargo weight");
      setErrors((prev) => ({
        ...prev,
        netWeight: "Net weight should not be greater than cargo weight",
      }));
      return;
    }

    // FORMATTING DATES FOR PAYLOAD
    const formattedCartingDate = moment(
      formData.cartingDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");
    const formattedShipBillDate = formData.shipBillDate
      ? moment(formData.shipBillDate, "DD-MM-YYYY").format("YYYY-MM-DD")
      : null;
    const formattedInvoiceDate = formData.invoiceDate
      ? moment(formData.invoiceDate, "DD-MM-YYYY").format("YYYY-MM-DD")
      : null;
    const formattedCommencingDateTime = formData.commencingDateTime
      ? moment(formData.commencingDateTime, "DD-MM-YYYY HH:mm").format(
          "YYYY-MM-DD HH:mm:ss"
        )
      : null;
    const formattedCompletionDateTime = formData.completionDateTime
      ? moment(formData.completionDateTime, "DD-MM-YYYY HH:mm").format(
          "YYYY-MM-DD HH:mm:ss"
        )
      : null;
    const formattedReadyDate = formData.readyDate
      ? moment(formData.readyDate, "DD-MM-YYYY").format("YYYY-MM-DD")
      : null;

    const payload = {
      carting_date: formattedCartingDate,
      carting_number: formData.cartingNumber || "",
      shipping_line_forwarder_name: formData.shippingForwarderLine,
      shipper: formData.shipper,
      clearing_agent: formData.clearingAgent,
      consignee: formData.consignee,
      agreement_party: formData.aggrementParty,
      yard: formData.yardId.toString(),
      ship_bill_number: formData.shipBillNumber,
      ship_bill_date: formattedShipBillDate,
      po_number: formData.poNumber,
      booking_number: formData.bookingNumber,
      invoice_number: formData.invoiceNumber,
      invoice_date: formattedInvoiceDate,
      pod: formData.pod,
      fpd: formData.fpd,
      cargo: formData.cargo,
      cargo_weight: parseFloat(formData.cargoWeight),
      packages: parseInt(formData.packages),
      packed_in: formData.packedIn,
      marks: formData.marks,
      number: formData.number,
      cargo_condition: formData.cargoCondition,
      sku: formData.sku,
      icd_dfs: formData.icdDfs,
      location_of_cargo: formData.locationOfCargo,
      style: formData.style,
      cartingDimention_data: ctmList.map((ctm) => ({
        receivedCTM: ctm.recievedCTM,
        length: ctm.length,
        breadth: ctm.breadth,
        height: ctm.height,
        total: ctm.total,
      })),
      cbm: parseFloat(formData.cbm),
      ready_not_ready: formData.ready,
      ispmNumber: formData.ispmNumber,
      ready_date: formattedReadyDate,
      ispm: formData.ispm || "",
      hs_code: formData.hsCode,
      truck_number: formData.truckNumber,
      reporting_date_time: formData.reportDateTime || null,
      get_in_date_time: formData.getInDateTime || null,
      commencing_date_time: formattedCommencingDateTime,
      completion_date_time: formattedCompletionDateTime,
      remarks: formData.remarks,
      rows_data: rows.map((res) => ({
        po: res.po || "",
        bookingNo: res.bookingNo || "",
        style: res.style || "",
        cargoWeight: res.cargoWeight.toString(),
        packages: res.packages.toString(),
        packedIn: res.packedIn || "",
        marks: res.marks || "",
        cbm: res.cbm.toString(),
        reportingDateTime: res.reportingDateTime || new Date().toISOString(),
        truckNo: res.truckNo || "",
        gateInDateTime: res.gateInDateTime || new Date().toISOString(),
        commencingDateTime: res.commencingDateTime || new Date().toISOString(),
        completionDateTime: res.completionDateTime || new Date().toISOString(),
        remarks: res.remarks || "",
      })),
    };

    const response = await operationService.cartingLCL(payload);
    if (response.success) {
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED CARTING-LCL OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
      );
      navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
    } else {
      toast.error("Carting LCL Creating failed");
    }
  };

  useEffect(() => {
    dispatch(fetchYards());
  }, [dispatch]);

  const handleAddRows = () => {
    const rows = Array.from({ length: Number(rowCount) }, () => ({
      po: "",
      bookingNo: "",
      style: "",
      cargoWeight: "",
      packages: "",
      packedIn: "",
      marks: "",
      cbm: "",
      reportingDateTime: "",
      truckNo: "",
      gateInDateTime: "",
      commencingDateTime: "",
      completionDateTime: "",
      remarks: "",
    }));
    setRows(rows);
    setRowCount(0);
  };

  const handleChangeDynamic = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

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
    } else if (name === "cartingDate") {
      // Only apply before/after validation for allotmentDate
      if (inputDate.isBefore(minimum)) {
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
  };

  console.log("enableCBM::", enableCBM);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Carting Of Container LCL"
        parent="Apps"
        title="Carting Of Container LCL"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <div className="shadow-sm p-4  mt-4">
                <h5 className="mb-3">Client Details</h5>
                <Row className="mb-3">
                  <Col md="4">
                    <label htmlFor="">
                      Carting Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="cartingDate"
                      type="text"
                      className={`form-control ${
                        errors.cartingDate ? "is-invalid" : ""
                      }`}
                      value={formData.cartingDate}
                      onChange={handleDateChange}
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="DD-MM-YYYY"
                      required
                    />
                    {errors.cartingDate && (
                      <div className="invalid-feedback">
                        {errors.cartingDate}
                      </div>
                    )}
                  </Col>

                  {/* <Col md="6">
                    <label className="">Carting Number</label>
                    <input name="cartingNumber" type="number" className="form-control" placeholder="Carting Number" onChange={handleChange} value={formData.cartingNumber} />
                  </Col> */}
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">
                      Shipping/Forwarder Name{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="shippingForwarderLine"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.shippingForwarderLine}
                    >
                      <option value="">Select Forwarders</option>
                      {forwarders.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                  <Col md="6">
                    <label className="">Shipper</label>
                    <input
                      name="shipper"
                      type="text"
                      className="form-control"
                      placeholder="Shipper"
                      onChange={handleChange}
                      value={formData.shipper}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Clearing Agent</label>
                    <input
                      name="clearingAgent"
                      type="text"
                      className="form-control"
                      placeholder="Clearing Agent"
                      onChange={handleChange}
                      value={formData.clearingAgent}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Consignee</label>
                    <input
                      name="consignee"
                      type="text"
                      className="form-control"
                      placeholder="Consignee"
                      onChange={handleChange}
                      value={formData.consignee}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Aggrement Party</label>
                    <input
                      name="aggrementParty"
                      type="text"
                      className="form-control"
                      placeholder="Agreement Party"
                      onChange={handleChange}
                      value={formData.aggrementParty}
                    />
                  </Col>

                  <Col md="6">
                    <label className="">
                      ICD Name <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="icdDfs"
                      onChange={handleChange}
                      value={formData.icdDfs}
                      className={`form-control`}
                    >
                      <option value="">Select ICD</option>
                      {icds.map((icd) => (
                        <option key={icd.id} value={icd.id}>
                          {icd.code} - {icd.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>
              </div>
              <div className="shadow-sm p-4  mt-4">
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Ship Bill Number</label>
                    <input
                      name="shipBillNumber"
                      type="text"
                      placeholder="Ship Bill Number"
                      className={`form-control ${
                        errors.shipBillNumber ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.shipBillNumber}
                    />
                    {errors.shipBillNumber && (
                      <div className="invalid-feedback">
                        {errors.shipBillNumber}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label className="">Ship Bill Date</label>
                    <input
                      name="shipBillDate"
                      type="text"
                      placeholder="DD-MM-YYYY"
                      className={`form-control ${
                        errors.shipBillDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDateChange}
                      value={formData.shipBillDate}
                    />

                    {errors.shipBillDate && (
                      <div className="invalid-feedback">
                        {errors.shipBillDate}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">PO Number</label>
                    <input
                      name="poNumber"
                      type="text"
                      className="form-control"
                      placeholder="PO Number"
                      onChange={handleChange}
                      value={formData.poNumber}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Booking Number</label>
                    <input
                      name="bookingNumber"
                      type="text"
                      className="form-control"
                      placeholder="Booking Number"
                      onChange={handleChange}
                      value={formData.bookingNumber}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Invoice Number</label>
                    <input
                      name="invoiceNumber"
                      type="text"
                      className="form-control"
                      placeholder="Invoice Number"
                      onChange={handleChange}
                      value={formData.invoiceNumber}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Invoice Date</label>
                    <input
                      name="invoiceDate"
                      type="text"
                      placeholder="DD-MM-YYYY"
                      className={`form-control ${
                        errors.invoiceDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDateChange}
                      value={formData.invoiceDate}
                      place
                    />
                    {errors.invoiceDate && (
                      <div className="invalid-feedback">
                        {errors.invoiceDate}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">POD</label>
                    <input
                      name="pod"
                      type="text"
                      className="form-control"
                      placeholder="POD"
                      onChange={handleChange}
                      value={formData.pod}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">FPD</label>
                    <input
                      name="fpd"
                      type="text"
                      className="form-control"
                      placeholder="FPD"
                      onChange={handleChange}
                      value={formData.fpd}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Cargo</label>
                    <input
                      name="cargo"
                      type="text"
                      className="form-control"
                      placeholder="Cargo"
                      onChange={handleChange}
                      value={formData.cargo}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Cargo Weight</label>
                    <input
                      name="cargoWeight"
                      type="text"
                      className="form-control"
                      placeholder="Cargo Weight"
                      onChange={handleChange}
                      value={formData.cargoWeight}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Net Weight</label>
                    <input
                      name="netWeight"
                      type="text"
                      className="form-control"
                      placeholder="Net Weight"
                      onChange={handleChange}
                      value={formData.netWeight}
                    />
                    {errors.netWeight && (
                      <span className="text-danger">{errors.netWeight}</span>
                    )}
                  </Col>
                  {/* <Col md="6">
                    <label className="">Packages</label>
                    <input
                      name="packages"
                      type="number"
                      className="form-control"
                      placeholder="Packages"
                      onChange={handleChange}
                      value={formData.packages}
                    />
                  </Col> */}
                  <Col md="6">
                    <label className="">Packages</label>
                    <input
                      name="packages"
                      type="number"
                      className="form-control"
                      placeholder="Packages"
                      onChange={handleChange}
                      value={formData.packages}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Packed In</label>
                    <input
                      name="packedIn"
                      type="text"
                      className="form-control"
                      placeholder="Packed In"
                      onChange={handleChange}
                      value={formData.packedIn}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Marks</label>
                    <input
                      name="marks"
                      type="text"
                      className="form-control"
                      placeholder="Marks"
                      onChange={handleChange}
                      value={formData.marks}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Numbers</label>
                    <input
                      name="number"
                      type="text"
                      className="form-control"
                      placeholder="Number"
                      onChange={handleChange}
                      value={formData.number}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Cargo Condition</label>
                    <select
                      name="cargoCondition"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.cargoCondition}
                    >
                      <option value="">Cargo Condition</option>
                      <option value="ok">Ok</option>
                      <option value="damage">Damage</option>
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">SKU</label>
                    <input
                      name="sku"
                      type="text"
                      className="form-control"
                      placeholder="SKU"
                      onChange={handleChange}
                      value={formData.sku}
                    />
                  </Col>
                  <Col md="6">
                    <label>
                      Yard Name{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="yardId"
                      onChange={handleChange}
                      value={formData.yardId}
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
                  {/* <Col md="6">
                    <label className="">ICD/CFS</label>
                    <input
                      name="icdDfs"
                      type="text"
                      className="form-control"
                      placeholder="ICD/DFS"
                      onChange={handleChange}
                      value={formData.icdDfs}
                    />
                  </Col> */}
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label className="">Location Of Cargo</label>
                    <input
                      name="locationOfCargo"
                      type="text"
                      className="form-control"
                      placeholder="Location of Cargo"
                      onChange={handleChange}
                      value={formData.locationOfCargo}
                    />
                  </Col>
                  <Col md="6">
                    <label className="">Style</label>
                    <input
                      name="style"
                      type="text"
                      className="form-control"
                      placeholder="Style"
                      onChange={handleChange}
                      value={formData.style}
                    />
                  </Col>
                </Row>

                <div className="shadow-sm p-4  mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Cargo Dimension Details</h5>
                    <div>
                      <button
                        className="btn btn-primary me-2"
                        onClick={addMoreCTM}
                      >
                        Add More
                      </button>
                      <span className="fw-semibold">
                        Total Entries: {ctmList.length}
                      </span>
                    </div>
                  </div>

                  {ctmList.map((item, index) => (
                    <Row className="mb-3" key={item.id}>
                      <Col md="2">
                        <label>Recieved Packages</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.recievedCTM}
                          onChange={(e) =>
                            handleCTMChange(
                              index,
                              "recievedCTM",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col md="2">
                        <label>Length</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.length}
                          onChange={(e) =>
                            handleCTMChange(index, "length", e.target.value)
                          }
                        />
                      </Col>
                      <Col md="2">
                        <label>Breadth</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.breadth}
                          onChange={(e) =>
                            handleCTMChange(index, "breadth", e.target.value)
                          }
                        />
                      </Col>
                      <Col md="2">
                        <label>Height</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.height}
                          onChange={(e) =>
                            handleCTMChange(index, "height", e.target.value)
                          }
                        />
                      </Col>
                      <Col md="2">
                        <label>Total (CBM)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.total}
                          readOnly
                        />
                      </Col>
                      <Col md="2" className="d-flex align-items-end">
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => removeCTMRow(index)}
                        >
                          Cancel
                        </button>
                      </Col>
                    </Row>
                  ))}

                  <Row className="mb-4">
                    {/* <Col md="3">
                      <label>Total(Recieved Packages)</label>
                      <input
                        type="text"
                        className="form-control fw-bold"
                        value={totalPackages}
                        readOnly
                      />
                    </Col> */}
                    <Col md="3">
                      <label>Total (Received Packages)</label>
                      <input
                        type="text"
                        className={`form-control fw-bold ${
                          packageMismatchError ? "is-invalid" : ""
                        }`}
                        value={totalPackages}
                        readOnly
                      />
                      {packageMismatchError && (
                        <div className="invalid-feedback d-block">
                          {packageMismatchError}
                        </div>
                      )}
                    </Col>
                    <Col md="5"></Col>
                    <Col md="3">
                      <label>Total(CBM)</label>
                      <input
                        name="cbm"
                        type="text"
                        className="form-control fw-bold"
                        value={cbm}
                        onChange={handleChange}
                        readOnly={enableCBM}
                      />
                    </Col>
                    <Col md="1"></Col>
                  </Row>
                </div>

                <div className="shadow-sm p-4  mt-2">
                  <Row className="mb-3">
                    <Col md="6">
                      <label className="">Shipper CBM</label>
                      <input
                        name="shipperCbm"
                        type="text"
                        className="form-control"
                        placeholder="Shipper CBM"
                        onChange={handleChange}
                        value={formData.shipperCbm}
                        onBlur={handleBlur}
                      />
                    </Col>
                    <Col md="6">
                      <label className="">Ready / Not Ready</label>
                      <select
                        name="ready"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.ready}
                      >
                        <option value="Ready">Ready</option>
                        <option value="Not Ready">Not Ready</option>
                      </select>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <label className="">Ready Date</label>
                      <input
                        disabled={formData.ready === "Not Ready"}
                        name="readyDate"
                        type="text"
                        placeholder="DD-MM-YYYY"
                        className={`form-control ${
                          errors.readyDate ? "is-invalid" : ""
                        }`}
                        onChange={handleDateChange}
                        value={formData.readyDate}
                      />
                      {errors.readyDate && (
                        <div className="invalid-feedback">
                          {errors.readyDate}
                        </div>
                      )}
                    </Col>
                    <Col md="6">
                      <label className="">ISPM</label>
                      <select
                        name="ispm"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.ispm}
                      >
                        <option value="">Select ISPM</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </Col>
                  </Row>
                  {formData.ispm == "yes" && (
                    <Row className="mb-3">
                      <Col md="6">
                        <label className="">ISPM Number</label>
                        <input
                          name="ispmNumber"
                          type="text"
                          className="form-control"
                          placeholder="ISPM Number"
                          onChange={handleChange}
                          value={formData.ispmNumber}
                        />
                      </Col>
                    </Row>
                  )}

                  <Row className="mb-3">
                    <Col md="6">
                      <label className="">Truck Number</label>
                      <input
                        name="truckNumber"
                        type="text"
                        className="form-control"
                        placeholder="Truck Number"
                        onChange={handleChange}
                        value={formData.truckNumber}
                      />
                    </Col>
                    <Col md="6">
                      <label className="">HS Code</label>
                      <input
                        name="hsCode"
                        type="text"
                        className="form-control"
                        placeholder="HS Code"
                        onChange={handleChange}
                        value={formData.hsCode}
                      />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <label className="">FOB Value</label>
                      <input
                        name="fobValue"
                        type="text"
                        className="form-control"
                        placeholder="FOB Value"
                        onChange={handleChange}
                        value={formData.fobValue}
                      />
                    </Col>
                  </Row>
                </div>
              </div>
              <div className="shadow-sm p-4  mt-4">
                {/* client ke case me dikhana hai */}

                <Row className="mb-3">
                  <Col md="4">
                    <FormGroup switch>
                      <Input
                        type="switch"
                        checked={disableFields}
                        onChange={() => setDisableFields(!disableFields)}
                      />
                      <Label check>Disable Date/Remarks</Label>
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="4">
                    <label>Commencing Date & Time</label>
                    <input
                      name="commencingDateTime"
                      type="text"
                      className={`form-control ${
                        errors.commencingDateTime ? "is-invalid" : ""
                      }`}
                      onChange={handleDateTimeChange}
                      value={formData.commencingDateTime}
                      disabled={disableFields}
                      placeholder="DD-MM-YYYY HH:MM"
                    />
                    {errors.commencingDateTime && (
                      <div className="invalid-feedback">
                        {errors.commencingDateTime}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label>Completion Date & Time</label>
                    <input
                      name="completionDateTime"
                      type="text"
                      className={`form-control ${
                        errors.completionDateTime ? "is-invalid" : ""
                      }`}
                      onChange={handleDateTimeChange}
                      value={formData.completionDateTime}
                      disabled={disableFields}
                      placeholder="DD-MM-YYYY HH:MM"
                    />
                    {errors.completionDateTime && (
                      <div className="invalid-feedback">
                        {errors.completionDateTime}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label>Remarks</label>
                    <textarea
                      name="remarks"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.remarks}
                      disabled={disableFields}
                    ></textarea>
                  </Col>
                </Row>
              </div>

              <div>
                <Row>
                  <DynamicForm
                    rows={rows}
                    setRows={setRows}
                    setRowCount={setRowCount}
                    handleChangeDynamic={handleChangeDynamic}
                    handleAddRows={handleAddRows}
                    disableFields={disableFields}
                  />
                </Row>
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

export default CartingLCLContainer;
