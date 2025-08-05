import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchICDs } from "../../Redux/slices/icdsSlice";

const MeasurementDetails = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartingData, setCartingData] = useState({});
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [formErrors, setFormErrors] = useState({});
  const forwardersState = useSelector((state) => state.forwarders || {});
  const forwarders = forwardersState?.data || [];
  const { icds, loading } = useSelector((state) => state.icd);
  const [measurementRateData, setMeasurementRateData] = useState({});
  const [packageMismatch, setPackageMismatch] = useState(false);
  const dispatch = useDispatch();

  // Initialize formData as an empty object
  const [formData, setFormData] = useState({
    shipBillNumber: "",
    measurementNumber: "",
    measurementDate: moment().format("DD-MM-YYYY"),
    typeOfPayment: "",
    shippingLine: "",
    serviceTax: "applicable",
    serviceTaxRate: "",
    shipperApplicant: "",
    clearingAgent: "",
    noOfPackages: "",
    packedIn: "",
    pod: "",
    fpd: "",
    cargo: "",
    hsCode: "",
    shipBillDate: "",
    icdCfs: "",
    anyOtherRemarks: "",
    locationOfCargo: "",
    measurementType: "export",
    paidBy: "",
    gstNumber: "",
    formatType: "pdf",
    receiptNeeded: "yes",
    packageIncludedInMinimumAmount: "",
    rateForAdditionalPackage: "",
    minimumAmount: "",
    additionalAmount: "",
    totalAmount: "",
    serviceTaxAmount: "",
    gstRate: "",
  });

  const [formList, setFormList] = useState([
    {
      marks: 0,
      numOfPackages: 0,
      length: 0,
      breadth: 0,
      height: 0,
      cubicMetres: 0.0,
    },
  ]);

  useEffect(() => {
    if (cartingData.data && cartingData.data.length > 0) {
      const cartingItem = cartingData.data[0]; // Get the first item from the array
      console.log("cartingItem::", cartingItem);

      setFormData((prev) => ({
        ...prev,
        // shipBillNumber: cartingItem.ship_bill_number || "",
        shippingLine: cartingItem.shipping_line_forwarder_name || "",
        shipperApplicant: cartingItem.shipper || "",
        clearingAgent: cartingItem.clearing_agent || "",
        noOfPackages: cartingItem.packages || "",
        packedIn: cartingItem.packed_in || "",
        pod: cartingItem.pod || "",
        fpd: cartingItem.fpd || "",
        cargo: cartingItem.cargo || "",
        hsCode: cartingItem.hs_code || "",
        shipBillDate: cartingItem.ship_bill_date
          ? moment(cartingItem.ship_bill_date).format("DD-MM-YYYY")
          : "",
        icdCfs: cartingItem.icd_dfs || "",
        locationOfCargo: cartingItem.location_of_cargo || "",
      }));

      // Parse and populate formList from cartingDimention_data
      let dimensions = [];

      if (cartingItem.cartingDimention_data) {
        try {
          const parsed = JSON.parse(cartingItem.cartingDimention_data);
          dimensions = parsed.map((item) => ({
            marks: `01-${item.receivedCTM}` || "",
            numOfPackages: item.receivedCTM || 0,
            length: item.length || 0,
            breadth: item.breadth || 0,
            height: item.height || 0,
            cubicMetres: item.total
              ? Number(parseFloat(item.total).toFixed(3))
              : 0,
          }));
        } catch (err) {
          console.error("Invalid cartingDimention_data JSON:", err);
        }
      }

      // If cartingDimention_data is empty or invalid, fallback to marks + cbm
      if (dimensions.length === 0 && cartingItem.marks) {
        dimensions = [
          {
            marks: cartingItem.marks || "",
            numOfPackages: cartingItem.packages || 0,
            length: 0,
            breadth: 0,
            height: 0,
            cubicMetres: cartingItem.cbm ? parseFloat(cartingItem.cbm) : 0,
          },
        ];
      }

      if (dimensions.length > 0) {
        setFormList(dimensions);
      }
    }
  }, [cartingData]);

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchICDs());
  }, [dispatch]);

  // Function to handle input changes
  // const handleInputChange = (index, field, value) => {
  //   const updatedForms = [...formList];

  //   // Safely parse value
  //   const parsedValue = value === "" ? "" : parseFloat(value);

  //   updatedForms[index][field] = parsedValue;

  //   // Recalculate cubic metres when any dimension changes
  //   if (["length", "breadth", "height"].includes(field)) {
  //     const length = updatedForms[index].length || 0;
  //     const breadth = updatedForms[index].breadth || 0;
  //     const height = updatedForms[index].height || 0;

  //     updatedForms[index].cubicMetres = +(
  //       (length * breadth * height) /
  //       100000
  //     ).toFixed(3);
  //   }

  //   setFormList(updatedForms);
  // };

  const handleInputChange = (index, field, value) => {
    const updatedForms = [...formList];

    // For marks field, keep it as text
    if (field === "marks") {
      updatedForms[index][field] = value;
    }
    // For other fields, parse as number
    else {
      // Safely parse value - use empty string for empty input
      const parsedValue = value === "" ? "" : parseFloat(value) || 0;
      updatedForms[index][field] = parsedValue;

      // Recalculate cubic metres when any dimension changes
      if (["length", "breadth", "height"].includes(field)) {
        const length = updatedForms[index].length || 0;
        const breadth = updatedForms[index].breadth || 0;
        const height = updatedForms[index].height || 0;

        updatedForms[index].cubicMetres = +(
          (length * breadth * height) /
          100000
        ).toFixed(3);
      }
    }

    setFormList(updatedForms);
  };

  // Function to add a new row
  const addForm = () => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        marks: "",
        numOfPackages: 0,
        length: 0,
        breadth: 0,
        height: 0,
        cubicMetres: 0,
      },
    ]);
  };

  // Function to remove a row
  const removeRow = (index) => {
    setFormList((prevForms) => prevForms.filter((_, i) => i !== index));
  };

  // Function to calculate total sum for each column
  const getTotal = (field) => {
    return formList.reduce(
      (total, item) => total + (parseFloat(item[field]) || 0),
      0
    );
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type === "text") {
      value = value.toUpperCase();
    }

    if (name === "gstNumber") {
      if (value.length !== 15) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "GST number should have 15 characters",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const totalPackages = getTotal("numOfPackages");
    const formPackages = parseInt(formData.noOfPackages) || 0;
    setPackageMismatch(totalPackages !== formPackages);
  }, [formData.noOfPackages, formList]);

  const getMeasurementRate = async () => {
    try {
      const { measurementType, shippingLine } = formData;

      if (measurementType && shippingLine) {
        const payload = {
          typeOfRate: measurementType,
        };
        const res = await operationService.getMeasurementRateData(
          shippingLine,
          payload
        );

        console.log("Response::", res);

        if (res.success) {
          setMeasurementRateData(res.data);
          // Update formData based on the response
          setFormData((prev) => ({
            ...prev,
            packageIncludedInMinimumAmount: res.data.packagesMinAmount || "",
            rateForAdditionalPackage: res.data.additionalPackagesRate || "",
            minimumAmount: res.data.minAmount || "",
            serviceTaxRate: res.data.gstRate || "",
            gstRate: res.data.gstRate || "",
          }));
        }
      }
    } catch (error) {
      console.log("Error fetching measurement rate:", error);
    }
  };

  useEffect(() => {
    if (formData.measurementType && formData.shippingLine) {
      getMeasurementRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.measurementType, formData.shippingLine]);

  // const handleSave = async () => {
  //   const formattedMeasurementDate = moment(
  //     formData.measurementDate,
  //     "DD-MM-YYYY"
  //   ).format("YYYY-MM-DD");

  //   const formattedShipBillDate = moment(
  //     formData.shipBillDate,
  //     "DD-MM-YYYY"
  //   ).format("YYYY-MM-DD");

  //   const payload = {
  //     ship_bill_no: formData.shipBillNumber || null,
  //     measurement_date: formattedMeasurementDate,
  //     measurement_type: formData.measurementType,
  //     type_of_payment: formData.typeOfPayment,
  //     ship_line_forwarder_name: formData.shippingLine || "ABC Logistics",
  //     service_tax: parseFloat(formData.serviceTax) || 0,
  //     service_tax_rate: parseFloat(formData.serviceTaxRate) || 0,
  //     shipper_applicant: formData.shipperApplicant,
  //     clearing_agent: formData.clearingAgent,
  //     no_of_packages: parseInt(formData.noOfPackages) || 0,
  //     packed_in: formData.packedIn,
  //     pod: formData.pod,
  //     fpd: formData.fpd,
  //     cargo: formData.cargo,
  //     hs_code: formData.hsCode,
  //     ship_bill_date: formattedShipBillDate,
  //     icd_cfs: formData.icdCfs,
  //     any_other_remarks: formData.anyOtherRemarks,
  //     location_of_cargo: formData.locationOfCargo,
  //     paid_by: formData.paidBy,
  //     gstn_no: formData.gstNumber,
  //     packages_included_minimum_amount:
  //       parseInt(formData.packageIncludedInMinimumAmount) || 0,
  //     rate_for_additional_package:
  //       parseFloat(formData.rateForAdditionalPackage) || 0,
  //     minimum_amount: parseFloat(formData.minimumAmount) || 0,
  //     additional_amount: parseFloat(formData.additionalAmount) || 0,
  //     service_tax_amount: parseFloat(formData.serviceTaxAmount) || 0,
  //     total_amount: parseFloat(formData.totalAmount) || 0,
  //     table_rows_data: formList.map((row, index) => ({
  //       row_id: index + 1,
  //       description: row.marks,
  //       quantity: row.numOfPackages,
  //       weight: row.cubicMetres,
  //     })),
  //   };

  //   const response = await operationService.measurment(payload);
  //   console.log("MSG::", response);
  //   if (response.success) {
  //     toast.success(
  //       `YOU HAVE SUCCESSFULLY SAVED MEASUREMENT OPERATION. WHERE ENTRY ID IS ${response.data.id}`
  //     );
  //   } else if (response.msg == "Shipp Bill Number Does not exist") {
  //     toast.error("Shipp Bill Number Does not exist");
  //   }
  // };

  const handleSave = async () => {
    const mandatoryFields = {
      typeOfPayment: "Type of Payment",
      shippingLine: "Shipping Line",
      serviceTax: "GST",
      noOfPackages: "Number of Packages",
      icdCfs: "ICD/CFS",
      paidBy: "Paid By",
      gstNumber: "GST Number",
    };

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

    if (formData.shipBillDate) {
      const inputDate = moment(formData.shipBillDate, "DD-MM-YYYY", true);
      const current = moment(currentDate, "DD-MM-YYYY");

      if (!inputDate.isValid) {
        toast.error("Invalid Ship Bill Date format");
        setFormErrors((prev) => ({
          ...prev,
          shipBillDate: "Invalid Date format",
        }));
        return;
      }

      if (inputDate.isAfter(current)) {
        toast.error("Ship Bill Date cannot be in future");
        setFormErrors((prev) => ({
          ...prev,
          shipBillDate: "Date cannot be in future",
        }));
        return;
      }
    }

    const gstNumber = formData.gstNumber;
    if (gstNumber.length !== 15) {
      toast.error("Invalid GST Number, length should be of 15 characters");
      setFormErrors((prev) => ({
        ...prev,
        shipBillDate: "Invalid GST Number",
      }));
      return;
    }

    const formattedMeasurementDate = moment(
      formData.measurementDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const formattedShipBillDate = moment(
      formData.shipBillDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const payload = {
      ship_bill_no: formData.shipBillNumber || null,
      measurement_date: formattedMeasurementDate,
      measurement_type: formData.measurementType,
      type_of_payment: formData.typeOfPayment,
      ship_line_forwarder_name: formData.shippingLine || "ABC Logistics",
      service_tax: parseFloat(formData.serviceTax) || 0,
      service_tax_rate: parseFloat(formData.serviceTaxRate) || 0,
      shipper_applicant: formData.shipperApplicant,
      clearing_agent: formData.clearingAgent,
      no_of_packages: parseInt(formData.noOfPackages) || 0,
      packed_in: formData.packedIn,
      pod: formData.pod,
      fpd: formData.fpd,
      cargo: formData.cargo,
      hs_code: formData.hsCode,
      ship_bill_date: formattedShipBillDate,
      icd_cfs: formData.icdCfs,
      any_other_remarks: formData.anyOtherRemarks,
      location_of_cargo: formData.locationOfCargo,
      paid_by: formData.paidBy,
      gstn_no: formData.gstNumber,
      packages_included_minimum_amount:
        parseInt(formData.packageIncludedInMinimumAmount) || 0,
      rate_for_additional_package:
        parseFloat(formData.rateForAdditionalPackage) || 0,
      minimum_amount: parseFloat(formData.minimumAmount) || 0,
      additional_amount: parseFloat(formData.additionalAmount) || 0,
      service_tax_amount: parseFloat(formData.serviceTaxAmount) || 0,
      total_amount: parseFloat(formData.totalAmount) || 0,
      table_rows_data: formList.map((row, index) => ({
        row_id: index + 1,
        description: row.marks,
        quantity: row.numOfPackages,
        weight: row.cubicMetres,
      })),
    };

    const response = await operationService.measurment(payload);
    console.log("MSG::", response);
    if (response.success) {
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED MEASUREMENT OPERATION. WHERE ENTRY ID IS ${response.data.id}`
      );

      // Reset formData to initial state
      setFormData({
        shipBillNumber: "",
        measurementNumber: "",
        measurementDate: moment().format("DD-MM-YYYY"),
        typeOfPayment: "",
        shippingLine: "",
        serviceTax: "applicable",
        serviceTaxRate: "",
        shipperApplicant: "",
        clearingAgent: "",
        noOfPackages: "",
        packedIn: "",
        pod: "",
        fpd: "",
        cargo: "",
        hsCode: "",
        shipBillDate: "",
        icdCfs: "",
        anyOtherRemarks: "",
        locationOfCargo: "",
        measurementType: "export",
        paidBy: "",
        gstNumber: "",
        formatType: "pdf",
        receiptNeeded: "yes",
        packageIncludedInMinimumAmount: "",
        rateForAdditionalPackage: "",
        minimumAmount: "",
        additionalAmount: "",
        totalAmount: "",
        serviceTaxAmount: "",
        gstRate: "",
      });

      // Reset formList to initial state with one empty row
      setFormList([
        {
          marks: "",
          numOfPackages: 0,
          length: 0,
          breadth: 0,
          height: 0,
          cubicMetres: 0.0,
        },
      ]);

      // Also reset cartingData if needed
      setCartingData({});
    } else if (response.msg == "Shipp Bill Number Does not exist") {
      toast.error("Shipp Bill Number Does not exist");
    }
  };

  console.log("MeasurementData::", measurementRateData);

  const handleGo = useCallback(async () => {
    const value = formData.shipBillNumber;

    if (!value || value.trim() === "") {
      toast.error("Please enter ship bill number");
      return;
    }

    const payload = {
      ["ship_bill_number"]: value.split(",").map((item) => item.trim()),
    };

    try {
      const data = await operationService.getShipBillByCartingNumber(payload);

      const cartingArray = data.data?.data || [];

      if (data.success && cartingArray.length > 0) {
        toast.success("Carting Details Fetched Successfully!");
        setCartingData({ data: cartingArray });
      } else {
        toast.error(`Record for ${formData.shipBillNumber} does not exist!`);
        setCartingData({});
        setFormData((prev) => ({
          ...prev,
          shippingLine: "",
          shipperApplicant: "",
          clearingAgent: "",
          noOfPackages: "",
          packedIn: "",
          pod: "",
          fpd: "",
          cargo: "",
          hsCode: "",
          shipBillDate: "",
          icdCfs: "",
          locationOfCargo: "",
        }));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Something went wrong while fetching data");
    }
  }, [formData.shipBillNumber]);

  useEffect(() => {
    const {
      noOfPackages,
      packageIncludedInMinimumAmount,
      rateForAdditionalPackage,
      minimumAmount,
      gstRate,
      serviceTax,
    } = formData;

    const numPackages = parseInt(noOfPackages) || 0;
    const minPackages = parseInt(packageIncludedInMinimumAmount) || 0;
    const rate = parseFloat(rateForAdditionalPackage) || 0;
    const minAmount = parseFloat(minimumAmount) || 0;
    const gst = parseFloat(gstRate) || 0;

    let additionalAmount = 0;
    let stAmount = 0;
    let tAmount = 0;

    if (numPackages > minPackages) {
      additionalAmount = (numPackages - minPackages) * rate;
    }

    if (serviceTax === "applicable") {
      stAmount = ((minAmount + additionalAmount) * gst) / 100;
      tAmount = minAmount + additionalAmount + stAmount;
    } else {
      stAmount = 0.0;
      tAmount = minAmount + additionalAmount;
    }

    setFormData((prev) => ({
      ...prev,
      additionalAmount: additionalAmount.toFixed(2),
      serviceTaxAmount: stAmount.toFixed(2),
      totalAmount: tAmount.toFixed(2),
    }));
  }, [
    formData.noOfPackages,
    formData.packageIncludedInMinimumAmount,
    formData.rateForAdditionalPackage,
    formData.minimumAmount,
    formData.gstRate,
    formData.serviceTax,
  ]);

  const handleDateChange = (e) => {
    let { name, value } = e.target;

    // Remove all non-digit characters
    value = value.replace(/\D/g, "");

    // Auto-format as user types (DD-MM-YYYY)
    if (value.length > 2 && value.length <= 4) {
      // Format as DD-MM when 3-4 digits entered
      value = `${value.slice(0, 2)}-${value.slice(2)}`;
    } else if (value.length > 4) {
      // Format as DD-MM-YYYY when 5+ digits entered
      value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 8)}`;
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
    } else if (name === "measurementDate") {
      // Only apply before/after validation for allotmentDate
      if (inputDate.isBefore(minimum)) {
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
    } else if (inputDate.isAfter(current)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be in the future",
      }));
    } else {
      // For other dates (like shipBillDate), just clear the error if format is valid
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Measurement" parent="Apps" title="Measurement" />
      <Container fluid={true} className="container-wrap">
        <Row className="mb-3">
          <Col sm="12">
            <div className="card shadow p-4">
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Type of Measurement</label>
                  <select
                    name="measurementType"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.measurementType}
                  >
                    <option value="">Select Type</option>
                    <option value="export">Export</option>
                    <option value="import">Import</option>
                  </select>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    {formData.measurementType == "export" ? "Ship Bill" : "BL"}{" "}
                    Number
                  </label>
                  <input
                    name="shipBillNumber"
                    type="text"
                    className="form-control"
                    placeholder={
                      formData.measurementType == "export"
                        ? "Ship Bill Number"
                        : "BL Number"
                    }
                    onChange={handleChange}
                    value={formData.shipBillNumber}
                  />
                </Col>
                <Col md="3" className="mt-4">
                  <button className="btn btn-primary" onClick={handleGo}>
                    Go
                  </button>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Measurement Date</label>
                  <input
                    disabled
                    name="measurementDate"
                    type="text"
                    className={`form-control ${
                      formErrors.measurementDate ? "is-invalid" : ""
                    }`}
                    placeholder="DD-MM-YYYY"
                    onChange={handleDateChange}
                    value={formData.measurementDate}
                    max={currentDate}
                    min={minAllowedDate}
                  />
                  {formErrors.measurementDate && (
                    <div className="invalid-feedback">
                      {formErrors.measurementDate}
                    </div>
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    Type Of Payment{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="typeOfPayment"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.typeOfPayment}
                  >
                    <option value="">Select Type Of Payment</option>
                    <option value="cash">Cash</option>
                    <option value="billing">Billing</option>
                    <option value="upi">UPI</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">
                    Shipping Line{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="shippingLine"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.shippingLine}
                  >
                    <option value="">Shipping Line Code Name</option>
                    {forwarders.map((fwd) => (
                      <option key={fwd.id} value={fwd.id}>
                        {fwd.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    GST <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="serviceTax"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.serviceTax}
                  >
                    <option value="">Select GST</option>
                    <option value="applicable">APPLICABLE</option>
                    <option value="not-applicable">NOT APPLICABLE</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">GST Rate</label>
                  <input
                    name="serviceTaxRate"
                    type="text"
                    className="form-control"
                    placeholder="Service Tax Rate"
                    onChange={handleChange}
                    value={formData.serviceTaxRate}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Shipper Applicant</label>
                  <input
                    name="shipperApplicant"
                    type="text"
                    className="form-control"
                    placeholder="shipper/Applicant"
                    onChange={handleChange}
                    value={formData.shipperApplicant}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Clearing Agent</label>
                  <input
                    name="clearingAgent"
                    type="text"
                    className="form-control"
                    placeholder="Clearing Agent"
                    onChange={handleChange}
                    value={formData.clearingAgent}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    Number Of Packages{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <input
                    name="noOfPackages"
                    type="text"
                    className="form-control"
                    placeholder="No. Of Packages"
                    onChange={handleChange}
                    value={formData.noOfPackages}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Packed In</label>
                  <input
                    name="packedIn"
                    type="text"
                    className="form-control"
                    placeholder="Packed In"
                    onChange={handleChange}
                    value={formData.packedIn}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">POD</label>
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
                  <label htmlFor="">FPD</label>
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
                  <label htmlFor="">Cargo</label>
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
                  <label htmlFor="">HS Code</label>
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
                  <label htmlFor="">Ship Bill Date</label>
                  <input
                    name="shipBillDate"
                    type="text"
                    className={`form-control ${
                      formErrors.shipBillDate ? "is-invalid" : ""
                    }`}
                    placeholder="DD-MM-YYYY"
                    onChange={handleDateChange}
                    value={formData.shipBillDate}
                  />
                  {formErrors.shipBillDate && (
                    <div className="invalid-feedback">
                      {formErrors.shipBillDate}
                    </div>
                  )}
                </Col>
                <Col md="6">
                  <label>
                    ICD/CFS <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="icdCfs"
                    onChange={handleChange}
                    value={formData.icdCfs}
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
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Any Other Remarks</label>
                  <input
                    name="anyOtherRemarks"
                    type="text"
                    className="form-control"
                    placeholder="Any Other Remarks"
                    onChange={handleChange}
                    value={formData.anyOtherRemarks}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Location of Cargo</label>
                  <input
                    name="locationOfCargo"
                    type="text"
                    className="form-control"
                    placeholder="Location Of Cargo"
                    onChange={handleChange}
                    value={formData.locationOfCargo}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    {" "}
                    Paid By <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="paidBy"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.paidBy}
                  >
                    <option value="">Select Paid By</option>
                    <option value="clearing-agent">Clearing Agent</option>
                    <option value="forwarder">Forwarder</option>
                    <option value="shipper">Shipper</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">
                    GST Number <span className="large mb-1 text-danger">*</span>
                  </label>
                  <input
                    name="gstNumber"
                    type="text"
                    className={`form-control ${
                      formErrors.gstNumber ? "is-invalid" : ""
                    }`}
                    placeholder="GST Number"
                    onChange={handleChange}
                    value={formData.gstNumber}
                  />
                  {formErrors.gstNumber && (
                    <div className="invalid-feedback">
                      {formErrors.gstNumber}
                    </div>
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Package Included Min Amount</label>
                  <input
                    name="packageIncludedInMinimumAmount"
                    type="text"
                    className="form-control"
                    placeholder="Package Included in Min. Amount"
                    onChange={handleChange}
                    value={formData.packageIncludedInMinimumAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Rate for Additional Packages</label>
                  <input
                    name="rateForAdditionalPackage"
                    type="text"
                    className="form-control"
                    placeholder="Rate For Additional Package"
                    onChange={handleChange}
                    value={formData.rateForAdditionalPackage}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Minimum Amount</label>
                  <input
                    name="minimumAmount"
                    type="text"
                    className="form-control"
                    placeholder="Minimum Amount"
                    onChange={handleChange}
                    value={formData.minimumAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Additional Amount</label>
                  <input
                    name="additionalAmount"
                    type="text"
                    className="form-control"
                    placeholder="Additional Amount"
                    onChange={handleChange}
                    value={formData.additionalAmount}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Service Tax Amount</label>
                  <input
                    name="serviceTaxAmount"
                    type="text"
                    className="form-control"
                    placeholder="Service Tax Amount"
                    onChange={handleChange}
                    value={formData.serviceTaxAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Total Amount</label>
                  <input
                    name="totalAmount"
                    type="text"
                    className="form-control"
                    placeholder="Total Amount"
                    onChange={handleChange}
                    value={formData.totalAmount}
                  />
                </Col>
              </Row>
            </div>
            <div className="container mt-4">
              <button onClick={addForm} className="btn btn-primary mt-3">
                ➕ Add Row
              </button>
              <table className="table table-bordered">
                <thead className="bg-dark text-light">
                  <tr>
                    <th>Row Number</th>
                    <th>Marks</th>
                    <th>No. of Packages</th>
                    <th>Length</th>
                    <th>Breadth</th>
                    <th>Height</th>
                    <th>Cubic Metres</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formList.map((form, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          type="text" // Changed to text for marks field
                          className="form-control"
                          value={form.marks}
                          onChange={(e) =>
                            handleInputChange(index, "marks", e.target.value)
                          }
                        />
                      </td>
                      {[
                        "numOfPackages",
                        "length",
                        "breadth",
                        "height",
                        "cubicMetres",
                      ].map((field) => (
                        <td key={field}>
                          <input
                            type="number" // All other fields are number type
                            className="form-control"
                            value={
                              field === "cubicMetres"
                                ? parseFloat(form[field] || 0).toFixed(3)
                                : form[field]
                            }
                            onChange={(e) =>
                              handleInputChange(index, field, e.target.value)
                            }
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          onClick={() => removeRow(index)}
                          className="btn btn-danger"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Row for Total Sum */}
                  <tr className="bg-light font-weight-bold">
                    <td colSpan={2} className="text-center">
                      Total
                    </td>
                    <td>
                      {getTotal("numOfPackages")}
                      {packageMismatch && (
                        <div className="text-danger small">
                          Total is {getTotal("numOfPackages")} and expected is{" "}
                          {formData.noOfPackages}
                        </div>
                      )}
                    </td>
                    <td>{getTotal("length")}</td>
                    <td>{getTotal("breadth")}</td>
                    <td>{getTotal("height")}</td>
                    <td>{getTotal("cubicMetres").toFixed(3)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-primary w-100" onClick={handleSave}>
                Save
              </button>
            </div>

            <div className="container mt-4">
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">
                    {" "}
                    <strong>Report Format Type</strong>
                  </label>
                  <select
                    name="formatType"
                    id=""
                    className="form-select"
                    value={formData.formatType}
                  >
                    <option value="">Select</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">
                    {" "}
                    <strong> Is Measurement Receipt Needed </strong>
                  </label>
                  <select
                    name="receiptNeeded"
                    id=""
                    className="form-select"
                    value={formData.receiptNeeded}
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Col>
              </Row>

              {/* Centered Generate Report Button with margin below */}
              <div className="d-flex justify-content-center">
                <button className="btn btn-danger">Generate Report</button>
              </div>
            </div>

            {/* Save button with full width */}
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default MeasurementDetails;
