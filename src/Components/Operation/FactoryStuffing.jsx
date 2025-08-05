import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";

const FactoryStuffing = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [previousPageData, setPreviousPageData] = useState({});
  const [allotmentData, setAllotmentData] = useState({}); // New state for allotment data
  const [vgm, setVGM] = useState(0);
  const [vgmDiff, setVgmDiff] = useState(0);
  const [errors, setErrors] = useState({});
  const [cargoErrors, setCargoErrors] = useState([]); // for cargoDetails date errors
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");

  // Redux selectors
  const { fetchedContainer } = useSelector((state) => state.container);
  const { data: forwarders = [] } = useSelector(
    (state) => state.forwarders || {}
  );
  const { data: yards = [] } = useSelector((state) => state.yards || {});

  // Initial form states
  const initialFormData = {
    containerNumber: "",
    shippingLine: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    remarks: "",
    operation: location.state?.operation || "",
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    loadStatus: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    containerCondition: "",
    anyOtherCondition: "",
    cargoCategory: "",
    stuffingDate: "",
    bookingNumber: "",
    dischargePortName: "",
    fpd: "",
    pdaAccount: "",
    aggrementParty: "",
    vgmByShipper: "",
    vesselViaNumber: "",
    placeOfHandOver: "",
    shipline: "",
    custom: "",
    excise: "",
    other: "",
    otherSealRemarks: "",
    containerRemarks: "",
    mainRemark:
      " 1.CONTAINER FOUND EXTERNALLY/SOUND. 2.CARGO DETAILS/NO. OF PACKAGES WEIGHT OF THE CARGO AS DECLARED IN THE SHIPPING BILL/INVOICE.",
    anyOtherRemarks: "",
    totalCargoWeight: "0.000",
    totalCbm: "0.000",
    totalQtyManifest: "0",
    hsCode: "",
  };

  const initialCargoDetail = {
    shipBillNumber: "",
    shipBillDate: "",
    shipperName: "",
    consigneeName: "",
    cargo: "",
    "cargoWeight (in kg)": "0.000",
    cbm: "0.000",
    packedIn: "",
    packages: "0",
    marks: "",
    number: "",
    remarks: "",
  };

  const initialContainerDetail = {
    containerNumber: "",
    "cargoWeight (in kg)": "0.000",
    vgmByShipper: "",
    packedIn: "",
    packages: "0",
    marks: "",
    shipline: "",
    custom: "",
    remarks: "",
  };

  const fieldDisplayNames = {
    shipBillNumber: "Shipping Bill No.",
    shipBillDate: "Shipping Bill Date",
    shipperName: "Shipper Name",
    consigneeName: "Consignee Name",
    cargo: "Cargo",
    "cargoWeight (in kg)": "Cargo Weight (kg)",
    cbm: "CBM",
    packedIn: "Packed In",
    packages: "Packages",
    marks: "Marks",
    number: "Number",
    remarks: "Remarks",
  };

  // State management
  const [formData, setFormData] = useState(initialFormData);
  const [cargoDetails, setCargoDetails] = useState([]);
  const [containerDetails, setContainerDetails] = useState([]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const totalCargoWeight = cargoDetails.reduce(
      (sum, item) => sum + parseFloat(item["cargoWeight (in kg)"] || 0),
      0
    );
    const totalCbm = cargoDetails.reduce(
      (sum, item) => sum + parseFloat(item.cbm || 0),
      0
    );
    const totalQtyManifest = cargoDetails.reduce(
      (sum, item) => sum + parseInt(item.packages || 0, 10),
      0
    );

    setFormData((prev) => ({
      ...prev,
      totalCargoWeight: totalCargoWeight.toFixed(3),
      totalCbm: totalCbm.toFixed(3),
      totalQtyManifest: totalQtyManifest.toString(),
    }));
  }, [cargoDetails]);

  useEffect(() => {
    const loadData = async () => {
      const containerNumber = location.state?.containerNumber || "";
      if (containerNumber) {
        await dispatch(fetchContainerByNumber(containerNumber));
      }
      await dispatch(fetchForwarders());
      await dispatch(fetchYards());
    };

    loadData();
  }, [dispatch, location.state]);

  // Recalculate totals when cargo details change
  useEffect(() => {
    calculateTotals();
  }, [cargoDetails, calculateTotals]);

  // Form handlers
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "vgmByShipper") {
      // Use the value the user just typed
      const vgmByShipper = parseFloat(value || 0);
      const calculatedVgm = parseFloat(vgm || 0);
      const vgmDifference = calculatedVgm - vgmByShipper;

      // Allow ±1000 difference
      if (value && (vgmDifference < -1000 || vgmDifference > 1000)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "VGM is incorrect",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }

    if (
      name == "mainRemark" ||
      name == "anyOtherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateInput = (value) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, "");

    // Auto-format as user types
    if (digits.length > 0) {
      digits = digits.slice(0, 8); // Limit to 8 digits (DDMMYYYY)

      // Apply formatting
      if (digits.length <= 2) {
        return digits; // DD
      } else if (digits.length <= 4) {
        return `${digits.slice(0, 2)}-${digits.slice(2)}`; // DD-MM
      } else {
        return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(
          4,
          8
        )}`; // DD-MM-YYYY
      }
    }
    return "";
  };

  // const handleDetailChange = (index, field, value, isContainer = false) => {
  //   const setter = isContainer ? setContainerDetails : setCargoDetails;

  //   let processedValue = value;

  //   if (field === "shipBillDate") {
  //     // Get current value from state instead of 'form'
  //     const currentDetails = isContainer ? containerDetails : cargoDetails;
  //     const currentValue = currentDetails[index][field];

  //     // Handle backspace/delete
  //     if (value.length < currentValue.length) {
  //       processedValue = value; // Allow backspace
  //     } else {
  //       processedValue = handleDateInput(value); // Auto-format new input
  //     }
  //   } else if (getInputType(field) === "text") {
  //     processedValue = value.toUpperCase();
  //   }

  //   setter((prev) =>
  //     prev.map((item, i) =>
  //       i === index ? { ...item, [field]: processedValue } : item
  //     )
  //   );
  // };

  const handleDetailChange = (index, field, value, isContainer = false) => {
    const setter = isContainer ? setContainerDetails : setCargoDetails;
    const errorSetter = isContainer ? () => {} : setCargoErrors; // only cargo for now

    let processedValue = value;

    if (field === "shipBillDate") {
      const currentDetails = isContainer ? containerDetails : cargoDetails;
      const currentValue = currentDetails[index][field];

      // Handle backspace/delete
      if (value.length < currentValue.length) {
        processedValue = value;
      } else {
        processedValue = handleDateInput(value);
      }

      // Validation logic
      if (processedValue.length === 10) {
        const datePattern = /^(\d{2})([-/.])(\d{2})\2(\d{4})$/;
        const match = processedValue.match(datePattern);

        errorSetter((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const newErrors = [...safePrev];
          newErrors[index] = { ...newErrors[index] };

          if (!match) {
            newErrors[index].shipBillDate = "Date must be in DD-MM-YYYY format";
          } else {
            const [, day, separator, month, year] = match;
            const dateStr = `${day}${separator}${month}${separator}${year}`;
            const dateMoment = moment(
              dateStr,
              `DD${separator}MM${separator}YYYY`,
              true
            );

            if (!dateMoment.isValid()) {
              newErrors[index].shipBillDate = "Invalid date";
            } else if (dateMoment.isAfter(moment())) {
              newErrors[index].shipBillDate = "Date cannot be in the future";
            } else {
              newErrors[index].shipBillDate = undefined;
            }
          }
          return newErrors;
        });
      }
    } else if (getInputType(field) === "text") {
      processedValue = value.toUpperCase();
    }

    setter((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: processedValue } : item
      )
    );
  };

  const addDetailForm = useCallback((isContainer = false) => {
    const setter = isContainer ? setContainerDetails : setCargoDetails;
    const initial = isContainer ? initialContainerDetail : initialCargoDetail;

    setter((prev) => [
      ...prev,
      {
        ...initial,
        id: Date.now(),
        slNo: prev.length + 1,
      },
    ]);
  }, []);

  const removeDetailForm = (index, isContainer = false) => {
    const setter = isContainer ? setContainerDetails : setCargoDetails;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Input type helper

  const getInputType = (field) => {
    const lowerField = field.toLowerCase();

    // Check for shipBillDate first and return text type
    if (lowerField === "shipbilldate") return "text";
    if (lowerField === "shipbillnumber") return "text";

    // Other date fields remain as date inputs
    if (lowerField.includes("date")) return "date";

    if (
      lowerField.includes("number") ||
      lowerField.includes("weight") ||
      lowerField.includes("qty") ||
      lowerField.includes("cbm")
    )
      return "number";

    return "text";
  };

  // Calculate container totals
  const containerTotals = containerDetails.reduce(
    (acc, item) => ({
      cargoWeight:
        acc.cargoWeight + parseFloat(item["cargoWeight (in kg)"] || 0),
      packages: acc.packages + parseInt(item.packages || 0, 10),
    }),
    { cargoWeight: 0, packages: 0 }
  );

  const validateDateFormat = (dateString) => {
    // Regular expression for DD-MM-YYYY format
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(19|20)\d\d$/;

    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Additional validation for actual calendar dates
    const parts = dateString.split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const getPreviousData = async () => {
    try {
      const containerNumber = fetchedContainer?.container_number;
      if (!containerNumber) {
        console.log("No container number available yet");
        return;
      }

      // Fetch gate-in data first (required)
      const gateInRes = await operationService.getInDataFechByContainerNumber(
        containerNumber
      );

      if (!gateInRes?.success) {
        toast.error(
          `Failed to fetch gate-in data: ${
            gateInRes?.message || "Unknown error"
          }`
        );
        return;
      }

      const gateInData = gateInRes.data || gateInRes;
      setPreviousPageData(gateInData);

      // Initialize form with gate-in data
      const updatedFormData = {
        ...formData,

        //fetchedContainer
        containerNumber: fetchedContainer?.container_number || "",
        shippingLineId: fetchedContainer?.shipping_line_id || "",
        size: fetchedContainer?.size || "",
        type: fetchedContainer?.container_type || "",
        tareWeight: fetchedContainer?.tare_weight || "",
        mgWeight: fetchedContainer?.mg_weight || "",
        mfdDate: fetchedContainer?.mfd_date || "",
        cscValidity: fetchedContainer?.csc_validity || "",
        remarks: fetchedContainer?.remarks || "",

        //preiousePageData
        forwarder1: gateInData.forwarder1Id || gateInData.forwarder1 || "",
        forwarder2: gateInData.forwarder2Id || gateInData.forwarder2 || "",
        stuffingDate: gateInData.inDate
          ? moment(gateInData.inDate).format("DD-MM-YYYY")
          : "",
        shipline: gateInData.ship_line || gateInData.shipLine || "",
        yardName: gateInData.yard_id || gateInData.yard || "",
        custom: gateInData.custom || "",
        bookingNumber: gateInData.bookingNo || "",
        excise: gateInData.excise || "",
        other: gateInData.other || "",
        otherSealRemarks:
          gateInData.other_seal_desc || gateInData.otherSealDescription || "",
      };

      // Try to fetch allotment data (optional)
      try {
        const allotmentRes =
          await operationService.allotmentStuffingDetailsByContainerNo(
            containerNumber
          );

        if (allotmentRes?.success && allotmentRes.data) {
          const allotment = allotmentRes.data;
          setAllotmentData(allotmentRes);

          // Update form with allotment data if available
          Object.assign(updatedFormData, {
            cargoCategory: allotment.cargo_category || "",
            bookingNumber: allotment.booking_no || "",
            pol: allotment.pol || "",
            dischargePortName:
              allotment.discharge_port || allotment.discharge_port_name || "",
            fpd: allotment.fpd || "",
            pdaAccount: allotment.pda_account || "",
            aggrementParty:
              allotment.aggrement_party || allotment.agreement_party || "",
            vgmByShipper: allotment.vgm_by_shipper || "",
            vesselViaNumber:
              allotment.vessel_via_number || allotment.vessel_via_no || "",
            placeOfHandOver: allotment.place_of_handover || "",
            hsCode: allotment.hs_code || "",
          });

          // Set cargo details only if allotment exists
          setCargoDetails([
            {
              shipBillNumber: allotment.shipp_bill_no || "",
              shipBillDate: allotment.s_bill_date
                ? moment(allotment.s_bill_date).format("DD-MM-YYYY")
                : "",
              shipperName: allotment.shipper || "",
              consigneeName: allotment.consignee_name || "",
              cargo: allotment.cargo || "",
              "cargoWeight (in kg)": allotment.cargo_wt_kgs || "0.000",
              cbm: allotment.cbm || "0.000",
              packedIn: allotment.packed_in || "",
              packages: allotment.packages || "0",
              marks: allotment.marks || "",
              number: allotment.number || "",
              // remarks: allotment.remark || "",
              id: Date.now(),
              slNo: 1,
            },
          ]);
        }
      } catch (allotmentError) {
        console.log(
          "No allotment data found, proceeding with gate-in data only"
        );
      }

      setFormData(updatedFormData);
    } catch (error) {
      console.error("Error in getPreviousData:", error);
      toast.error(`Failed to fetch previous operation data: ${error.message}`);
    }
  };

  useEffect(() => {
    if (fetchedContainer?.container_number) {
      getPreviousData();
    }
  }, [fetchedContainer]);

  const handleDateChange = (e) => {
    let { name, value } = e.target;

    // Remove all non-digit characters
    value = value.replace(/\D/g, "");

    // Limit to 8 digits (DDMMYYYY)
    if (value.length > 8) value = value.slice(0, 8);

    // Auto-insert separators as user types
    if (value.length > 4) {
      value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}-${value.slice(2)}`;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate only when we have a complete date (DD-MM-YYYY)
    if (value.length === 10) {
      const datePattern = /^(\d{2})([-/.])(\d{2})\2(\d{4})$/;
      const match = value.match(datePattern);

      if (!match) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date must be in DD-MM-YYYY format",
        }));
        return;
      }

      const [, day, separator, month, year] = match;
      const dateStr = `${day}${separator}${month}${separator}${year}`;
      const dateMoment = moment(
        dateStr,
        `DD${separator}MM${separator}YYYY`,
        true
      );

      if (!dateMoment.isValid()) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Invalid date",
        }));
        return;
      }

      const current = moment();
      const minDate = moment().subtract(3, "days");

      if (dateMoment.isAfter(current)) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be in the future",
        }));
      } else if (dateMoment.isBefore(minDate)) {
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
    } else if (value.length > 0) {
      // Show error if partially entered but not complete
      setErrors((prev) => ({
        ...prev,
        [name]: "Please enter a complete date in DD-MM-YYYY format",
      }));
    } else {
      // Clear error if empty
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const mandatoryFields = {
        stuffingDate: "Stuffing Date",
        cargoCategory: "Cargo Category",
        yardName: "Yard Name",
        vgmByShipper: "VGM By Shipper",
      };

      if (formData.cargoCategory === "hazardous") {
        mandatoryFields.imoNumber = "IMO Number";
        mandatoryFields.unNumber = "UN Number";
      } else if (formData.cargoCategory === "refer") {
        mandatoryFields.temperature = "Temperature";
      } else if (formData.cargoCategory === "both") {
        mandatoryFields.imoNumber = "IMO Number";
        mandatoryFields.unNumber = "UN Number";
        mandatoryFields.temperature = "Temperature";
      }

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

      // Forwarder validation
      if (
        formData.forwarder1 &&
        formData.forwarder2 &&
        formData.forwarder1 === formData.forwarder2
      ) {
        toast.error("Forwarder 1 and Forwarder 2 must be different");
        setErrors((prev) => ({
          ...prev,
          forwarder2: "Forwarder 1 and Forwarder 2 must be different",
          forwarder1: "Forwarder 1 and Forwarder 2 must be different",
        }));
        return;
      }

      const inputDate = moment(formData.stuffingDate, "DD-MM-YYYY", true);
      const current = moment(currentDate, "DD-MM-YYYY");
      const minimum = moment(minAllowedDate, "DD-MM-YYYY");

      if (!inputDate.isValid()) {
        toast.error("Invalid date format for Stuffing Date");
        setErrors((prev) => ({
          ...prev,
          stuffingDate: "Invalid date format (DD-MM-YYYY)",
        }));
        return;
      } else if (inputDate.isAfter(current)) {
        toast.error("Stuffing Date cannot be in the future");
        setErrors((prev) => ({
          ...prev,
          stuffingDate: "Date cannot be in the future",
        }));
        return;
      } else if (inputDate.isBefore(minimum)) {
        toast.error("Stuffing Date cannot be more than 3 days in the past");
        setErrors((prev) => ({
          ...prev,
          stuffingDate: "Date cannot be more than 3 days in the past",
        }));
        return;
      }

      //Ship bill date validation
      for (let i = 0; i < cargoDetails.length; i++) {
        const dateValue = cargoDetails[i]?.shipBillDate?.trim() || "";

        if (dateValue) {
          const datePattern = /^(\d{2})([-/.])(\d{2})\2(\d{4})$/;
          const match = dateValue.match(datePattern);

          if (!match) {
            toast.error(`Form ${i + 1}: Date must be in DD-MM-YYYY format`);
            return;
          }

          const [, day, separator, month, year] = match;
          const dateStr = `${day}${separator}${month}${separator}${year}`;
          const dateMoment = moment(
            dateStr,
            `DD${separator}MM${separator}YYYY`,
            true
          );

          if (!dateMoment.isValid()) {
            toast.error(`Form ${i + 1}: Invalid date`);
            return;
          }

          if (dateMoment.isAfter(moment())) {
            toast.error(`Form ${i + 1}: Date cannot be in the future`);
            return;
          }
        }
      }

      const newErrors = {};
      // Calculate VGM difference
      const vgmByShipper = parseFloat(formData.vgmByShipper || 0);
      const calculatedVgm = parseFloat(vgm || 0);
      const vgmDifference = calculatedVgm - vgmByShipper;

      // Check if VGM by Shipper is entered and invalid
      if (
        formData.vgmByShipper &&
        (vgmDifference < -1000 || vgmDifference > 1000)
      ) {
        const shouldProceed = window.confirm(
          `VGM difference is ${vgmDifference} kgs (Calculated VGM: ${calculatedVgm} kgs, Shipper VGM: ${vgmByShipper} kgs). Do you want to proceed with this entry?`
        );

        if (!shouldProceed) {
          return; // Stop execution if user cancels
        }
      }

      const payload = {
        containerNumber: fetchedContainer?.container_number || "",
        forwarder1: formData.forwarder1 || "",
        forwarder2: formData.forwarder2 || "",
        cargoCategory: formData.cargoCategory || "",
        imoNumber: formData.imoNumber || "",
        unNumber: formData.unNumber || "",
        temperature: formData.temperature || "",
        stuffingDate:
          moment(formData.stuffingDate, "DD-MM-YYYY").format("YYYY-MM-DD") ||
          "",
        bookingNumber: formData.bookingNumber || "",
        yardId: formData.yardName || "",
        pol: formData.pol || "",
        dischargePortName: formData.dischargePortName || "",
        fpd: formData.fpd || "",
        pdaAccount: formData.pdaAccount || "",
        aggrementParty: formData.aggrementParty || "",
        bookedOn: moment(formData.bookedOn).format("YYYY-MM-DD") || "",
        vgmByShipper: formData.vgmByShipper || "",
        vesselViaNumber: formData.vesselViaNumber || "",
        placeOfHandOver: formData.placeOfHandOver || "",
        shipline: formData.shipline || "",
        custom: formData.custom || "",
        excise: formData.excise || "",
        other: formData.other || "",
        otherSealRemarks: formData.otherSealRemarks || "",
        remark: formData.mainRemark || "",
        anyOtherRemark: formData.anyOtherRemarks || "",
        cargoDetails,
        containerDetails,
        hsCode: formData.hsCode || "",
      };

      const res = await operationService.factoryStuffing(payload);
      if (res.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED FACTORY STUFFING OPERATION FOR ${formData.containerNumber}. WHERE ENTRY ID IS ${res.message}`
        );
        localStorage.setItem("operation", 8);
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      }
    } catch (error) {
      console.log("Unable to fetch data");
    }
  };

  useEffect(() => {
    console.log("cargoDetails::", cargoDetails);
    const totalCargoWeight = cargoDetails.reduce(
      (sum, item) => sum + parseFloat(item["cargoWeight (in kg)"] || 0),
      0
    );
    const totalCbm = cargoDetails.reduce(
      (sum, item) => sum + parseFloat(item.cbm || 0),
      0
    );
    const totalQtyManifest = cargoDetails.reduce(
      (sum, item) => sum + parseInt(item.packages || 0, 10),
      0
    );
    const totalVGM =
      parseFloat(totalCargoWeight) + parseFloat(formData.tareWeight);
    setVGM(totalVGM);

    // Update formData
    setFormData((prev) => ({
      ...prev,
      totalCargoWeight: totalCargoWeight.toFixed(3),
      totalCbm: totalCbm.toFixed(3),
      totalQtyManifest: totalQtyManifest.toString(),
    }));
  }, [cargoDetails]);

  console.log("Previous Page Data::", previousPageData, cargoDetails);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Factory Stuffing Of Container"
        parent="Apps"
        title="Factory Stuffing Of Container"
      />

      <Container fluid className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange}
                forwarders={forwarders}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />

              <h5 className="mb-3 mt-5">Stuffing Details</h5>

              <Row className="mb-3">
                <Col md="6">
                  <label>Forwarder1 Name</label>
                  <select
                    name="forwarder1"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.forwarder1}
                  >
                    <option value="">Select Forwarder1 Code Name</option>
                    {forwarders
                      .filter((res) => res.category === "forwarder")
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </Col>

                <Col md="6">
                  <label>Forwarder2 Name</label>
                  <select
                    name="forwarder2"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.forwarder2}
                  >
                    <option value="">Select Forwarder2 Code Name</option>
                    {forwarders
                      .filter((res) => res.category === "forwarder")
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>
                    Stuffing Date{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <input
                    name="stuffingDate"
                    type="text"
                    className={`form-control ${
                      errors.stuffingDate ? "is-invalid" : ""
                    }`}
                    onChange={handleDateChange}
                    value={formData.stuffingDate}
                  />
                  {errors.stuffingDate && (
                    <div className="invalid-feedback">
                      {errors.stuffingDate}
                    </div>
                  )}
                </Col>
                {/*  */}
                {/* <Col md="6">
                  <label>Book</label>
                  <input
                    name="stuffingDate"
                    // type="date"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.stuffingDate}
                  />
                </Col> */}
                {/*  */}
                <Col md="6">
                  <label>
                    Cargo Category{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    name="cargoCategory"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.cargoCategory}
                  >
                    <option value="">Select Cargo Category</option>
                    <option value="hazardous">Hazardous</option>
                    <option value="non-hazardous">Non Hazardous</option>
                    <option value="refer">Refer</option>
                    <option value="both">Both</option>
                  </select>
                </Col>
              </Row>

              {(formData.cargoCategory === "hazardous" ||
                formData.cargoCategory == "both") && (
                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      IMO Number{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="imoNumber"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.imoNumber}
                    />
                  </Col>
                  <Col md="6">
                    <label>
                      UN Number{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
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
                formData.cargoCategory == "both") && (
                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      Temperature{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
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
                <Col md="6">
                  <label>Booking Number</label>
                  <input
                    name="bookingNumber"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.bookingNumber}
                  />
                </Col>

                <Col md="6">
                  <label>
                    Yard Name <span className="large mb-1 text-danger">*</span>
                  </label>
                  <select
                    disabled
                    name="yardName"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.yardName}
                  >
                    <option value="">Select Yard</option>
                    {yards.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>POL</label>
                  <input
                    name="pol"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.pol}
                  />
                </Col>

                <Col md="6">
                  <label>Discharge PORT Name</label>
                  <input
                    name="dischargePortName"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.dischargePortName}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>FPD</label>
                  <input
                    name="fpd"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.fpd}
                  />
                </Col>

                <Col md="6">
                  <label>PDA Account</label>
                  <select
                    name="pdaAccount"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.pdaAccount}
                  >
                    <option value="">Select PDA</option>
                    <option value="shipper pda">Shipper PDA</option>
                    <option value="liner pda">Liner PDA</option>
                  </select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>Aggrement Party</label>
                  <input
                    name="aggrementParty"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.aggrementParty}
                  />
                </Col>
                <Col md="6">
                  <label>
                    VGM By Shipper{" "}
                    <span className="large mb-1 text-danger">*</span>
                  </label>
                  <input
                    name="vgmByShipper"
                    type="text"
                    className={`form-control ${
                      errors.vgmByShipper ? "is-invalid" : ""
                    }`}
                    onChange={handleChange}
                    value={formData.vgmByShipper}
                  />
                  {errors.vgmByShipper && (
                    <div className="invalid-feedback">
                      {errors.vgmByShipper}
                    </div>
                  )}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>Vessel/Via Number</label>
                  <input
                    name="vesselViaNumber"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.vesselViaNumber}
                  />
                </Col>
                <Col md="6">
                  <label>HS Code</label>
                  <input
                    name="hsCode"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.hsCode}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label>Place Of Handover</label>
                  <input
                    name="placeOfHandOver"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.placeOfHandOver}
                  />
                </Col>
              </Row>

              <div className="shadow-sm p-4  mt-4">
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <button
                    className="btn btn-primary w-25"
                    onClick={() => addDetailForm(false)}
                  >
                    Proceed to enter Cargo Detail
                  </button>
                  <span className="badge bg-info fs-6">
                    Forms Open: {cargoDetails.length}
                  </span>
                </div>

                {cargoDetails.map((form, index) => (
                  <div key={form.id} className="mt-4 p-4 border rounded">
                    <Row>
                      {Object.entries(form).map(([field, value]) => {
                        const isDateField = field === "shipBillDate";
                        const isValidDate = isDateField
                          ? validateDateFormat(value)
                          : true;

                        return (
                          !["slNo", "id"].includes(field) && (
                            <Col md="4" key={field} className="mb-2">
                              <label className="form-label">
                                {fieldDisplayNames[field]}
                              </label>
                              <input
                                type={
                                  isDateField ? "text" : getInputType(field)
                                }
                                value={value}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    field,
                                    e.target.value
                                  )
                                }
                                className={`form-control ${
                                  isDateField &&
                                  cargoErrors[index]?.shipBillDate
                                    ? "is-invalid"
                                    : ""
                                }`}
                                style={{
                                  textTransform:
                                    getInputType(field) === "text"
                                      ? "uppercase"
                                      : "none",
                                }}
                                placeholder={isDateField ? "DD-MM-YYYY" : ""}
                                maxLength={isDateField ? 10 : undefined}
                              />
                              {isDateField &&
                                cargoErrors[index]?.shipBillDate && (
                                  <div className="invalid-feedback">
                                    {cargoErrors[index].shipBillDate}
                                  </div>
                                )}
                            </Col>
                          )
                        );
                      })}
                    </Row>
                    <div className="d-flex justify-content-end col-12">
                      <button
                        onClick={() => removeDetailForm(index, false)}
                        className="btn btn-danger mt-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h5 className="mb-3 mt-4">Total Calculated Values</h5>
              <Row className="mb-3">
                <Col md="4">
                  <input
                    readOnly
                    className="form-control"
                    value={formData.totalCargoWeight}
                  />
                </Col>
                <Col md="4">
                  <input
                    readOnly
                    className="form-control"
                    value={formData.totalCbm}
                  />
                </Col>
                <Col md="4">
                  <input
                    readOnly
                    className="form-control"
                    value={formData.totalQtyManifest}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="4">
                  <button
                    onClick={() => addDetailForm(true)}
                    className="btn btn-primary"
                  >
                    Add Container
                  </button>
                </Col>
              </Row>

              {containerDetails.map((form, index) => (
                <div key={form.id} className="mt-2 p-4 border rounded">
                  <Row>
                    {Object.entries(form).map(
                      ([field, value]) =>
                        !["slNo", "id"].includes(field) && (
                          <Col md="4" key={field} className="mb-2">
                            <label className="form-label">{field}</label>
                            <input
                              type={
                                field === "cargoWeight (in kg)" ||
                                field === "packages"
                                  ? "number"
                                  : "text"
                              }
                              value={value}
                              onChange={(e) =>
                                handleDetailChange(
                                  index,
                                  field,
                                  e.target.value,
                                  true
                                )
                              }
                              className="form-control"
                            />
                          </Col>
                        )
                    )}
                  </Row>
                  <div className="d-flex justify-content-end col-12">
                    <button
                      onClick={() => removeDetailForm(index, true)}
                      className="btn btn-danger mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}

              <Row className="mt-4 p-3 border rounded bg-light text-dark">
                <Col md="6">
                  <label className="form-label">
                    <strong>Total Cargo Weight (kg):</strong>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={containerTotals.cargoWeight.toFixed(3)}
                    readOnly
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">
                    <strong>Total Quantity Manifest:</strong>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={containerTotals.packages}
                    readOnly
                  />
                </Col>
              </Row>

              <h6 className="mt-5">Seal Details</h6>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Shipline</label>
                  <input
                    name="shipline"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.shipline}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Custom</label>
                  <input
                    name="custom"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.custom}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Excise</label>
                  <input
                    name="excise"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.excise}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Other</label>
                  <input
                    name="other"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.other}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Other Seal Remarks</label>
                  <input
                    name="otherSealRemarks"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.otherSealRemarks}
                  />
                </Col>
              </Row>

              <h6 className="mt-5">Container Condition</h6>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="mainRemark"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.mainRemark}
                  />
                </Col>
                <Col md="6">
                  <label className="form-label">Any Other Remarks</label>
                  <textarea
                    name="anyOtherRemarks"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.anyOtherRemarks}
                  />
                </Col>
              </Row>

              <div className="text-center mt-4">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSubmit}
                >
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

export default FactoryStuffing;
