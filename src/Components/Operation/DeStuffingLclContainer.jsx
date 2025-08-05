import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, Table } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";

// Constants
const FIELDS_CONFIG = [
  { name: "consigneeName", label: "Consignee Name" },
  { name: "blAwnNumber", label: "BL/AWN Number" },
  { name: "blAwnDate", label: "BL/AWN Date", type: "text" },
  { name: "igmNo", label: "IGM No" },
  { name: "igmDate", label: "IGM Date", type: "text" },
  { name: "tpNo", label: "TP No" },
  { name: "tpDate", label: "TP Date", type: "text" },
  { name: "cargo", label: "Cargo" },
  { name: "cargoWeight", label: "Cargo Weight (in kg)" },
  { name: "cbm", label: "CBM" },
  { name: "packedIn", label: "Packed In" },
  { name: "qtyManifest", label: "Qty Manifest" },
  { name: "destuff", label: "Destuff" },
  { name: "excessShort", label: "Excess/Short" },
  { name: "marks", label: "Marks" },
  { name: "number", label: "Number" },
  { name: "remarks", label: "Remarks" },
];

const INITIAL_FORM_DATA = {
  containerNumber: "",
  shippingLineId: "",
  size: "",
  type: "",
  tareWeight: "",
  mgWeight: "",
  mfdDate: "",
  cscValidity: "",
  remarks: "",
  operation: "",
  forwarder1: "",
  forwarder2: "",
  transportMode: "",
  yardName: "",
  loadStatus: "",
  bookingNumber: "",
  nameOfConsignee: "",
  chaCodeName: "",
  sealCuttingDate: "",
  containerStatus: "",
  containerRemarks: "",
  anyOtherRemarks: "",
  totalCargoWeight: "0.000",
  totalCbm: "0.000",
  totalQtyManifest: "0",
  destuffDate: "",
  mainRemark: "",
  pod: "",
};

const DestuffLclContainer = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [containerData, setContainerData] = useState(
    location.state?.containerData || null
  );
  const [formList, setFormList] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [previousPageData, setPreviousPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(null);

  // Memoized values
  const currentDate = useMemo(() => moment().format("DD-MM-YYYY"), []);
  const minAllowedDate = useMemo(
    () => moment().subtract(3, "days").format("DD-MM-YYYY"),
    []
  );
  const selectedOperation = useMemo(
    () => location.state?.operation || "3",
    [location.state]
  );
  const operationFromStorage = useMemo(
    () => localStorage.getItem("operation"),
    []
  );

  // Redux selectors
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  const { data: containerTypes = [] } = useSelector(
    (state) => state.containerTypes || {}
  );
  const { data: yards, loading: yardsLoading } = useSelector(
    (state) => state.yards || {}
  );
  const transporters = useSelector((state) => state.transporters?.data || []);
  const { icds } = useSelector((state) => state.icd || {});

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formData2, setFormData2] = useState(INITIAL_FORM_DATA);

  // Fetch container data if not in location.state
  useEffect(() => {
    const fetchContainerData = async () => {
      if (!containerData) {
        try {
          const result = await dispatch(
            fetchContainerByNumber(containerNumber)
          );
          if (result.payload) {
            setContainerData(result.payload);
            navigate(location.pathname, {
              state: {
                ...location.state,
                containerData: result.payload,
                operation: selectedOperation,
              },
              replace: true,
            });
          }
        } catch (error) {
          toast.error("Failed to load container data");
        }
      }
    };

    fetchContainerData();
  }, [
    containerNumber,
    containerData,
    dispatch,
    location,
    navigate,
    selectedOperation,
  ]);

  // Initialize form data when containerData is available
  useEffect(() => {
    if (containerData) {
      const commonData = {
        containerNumber: containerData.container_number || "",
        shippingLineId: containerData.shipping_line_id || "",
        size: containerData.size || "",
        type: containerData.container_type || "",
        tareWeight: containerData.tare_weight || "",
        mgWeight: containerData.mg_weight || "",
        mfdDate: containerData.mfd_date || "",
        cscValidity: containerData.csc_validity || "",
        remarks: containerData.remarks || "",
        operation: selectedOperation || "",
      };

      setFormData(commonData);
      setFormData2(commonData);
    }
  }, [containerData, selectedOperation]);

  // Fetch supporting data
  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());
    dispatch(fetchICDs());
  }, [dispatch]);

  const toUpperCase = (value) => {
    if (typeof value === "string") {
      return value.toUpperCase();
    }
    return value;
  };

  // Get previous container details
  const getPreviousContainerDetails = useCallback(async () => {
    try {
      let res;
      let arrivalData;
      if (operationFromStorage === "5") {
        res = await operationService.destuffLclRequestContainer(
          containerNumber
        );
        arrivalData = await operationService.arrivalContainer(containerNumber);
        console.log(arrivalData.data);
      } else if (operationFromStorage === "2") {
        res = await operationService.arrivalContainer(containerNumber);
        arrivalData = res;
      }

      if (res?.success) {
        setPreviousPageData(res.data);
        setArrivalDate(arrivalData.data.arraival_date);
      }
    } catch (error) {
      console.error("Error fetching arrival data:", error);
      toast.error("Failed to load arrival data");
    }
  }, [containerNumber, operationFromStorage]);

  useEffect(() => {
    getPreviousContainerDetails();
  }, [getPreviousContainerDetails]);

  // Update form data when previousPageData changes
  useEffect(() => {
    if (!previousPageData) return;

    const updateFormData = () => {
      const updatedData = {
        forwarder1:
          previousPageData.forwarder1Id || previousPageData.forwarder1_id || "",
        forwarder2:
          previousPageData.forwarder2Id || previousPageData.forwarder2_id || "",
        yardName: previousPageData.yardId || previousPageData.yard_id || "",
        bookingNumber:
          previousPageData.bookingNumber ||
          previousPageData.booking_number ||
          "",
        nameOfConsignee: previousPageData.consigneeName || "",
        chaCodeName: previousPageData.chaCodeName || "",
        containerStatus:
          previousPageData.containerCondition ||
          previousPageData.container_status ||
          "",
        anyOtherRemarks:
          previousPageData.anyOtherRemarks ||
          previousPageData.other_remarks ||
          "",
        pod: previousPageData.pod || "",
        totalCargoWeight:
          previousPageData.totalCargoWeight ||
          previousPageData.total_cargo_weight ||
          "",
        totalCbm: previousPageData.totalCBM || previousPageData.total_cbm || "",
        totalQtyManifest:
          previousPageData.totalQtyManifest ||
          previousPageData.total_qty_manifest ||
          "",
        containerCondition: previousPageData.containerCondition || "",
        mainRemark: previousPageData.remarks || "",
      };

      setFormData2((prev) => ({ ...prev, ...updatedData }));
      setFormData((prev) => ({
        ...prev,
        totalCargoWeight: updatedData.totalCargoWeight,
        totalCbm: updatedData.totalCbm,
        totalQtyManifest: updatedData.totalQtyManifest,
        yardName: previousPageData.yardId || previousPageData.yard_id || "",
      }));

      if (previousPageData.cargoDetails?.length > 0) {
        const formattedCargoDetails = previousPageData.cargoDetails.map(
          (item) => ({
            id: item.id,
            slNo: item.slNo,
            blAwnNumber: item.blAwnNumber || "",
            blAwnDate: item.blAwnDate
              ? moment(item.blAwnDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : "",
            cargo: item.cargo || "",
            cargoWeight: item.cargoWeight || "0.000",
            cbm: item.cbm || "0.000",
            packedIn: item.packedIn || "",
            qtyManifest: item.qtyManifest?.toString() || "0",
            destuff: item.destuff?.toString() || "0",
            excessShort: item.excessShort || "",
            marks: item.marks || "",
            number: item.number || "",
            remarks: item.remarks || "",
            tpNo: item.tpNumber || "",
            tpDate: item.tpDate
              ? moment(item.tpDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : "",
            igmNo: item.igmNumber || "",
            igmDate: item.igmDate
              ? moment(item.igmDate, "DD-MM-YYYY").format("YYYY-MM-DD")
              : "",
            consigneeName: item.consignee_name || "",
          })
        );

        setFormList(formattedCargoDetails);
      }
    };

    updateFormData();
  }, [previousPageData]);
  console.log("Previous Page Data::", previousPageData);

  // Calculate totals when formList changes
  useEffect(() => {
    const totals = formList.reduce(
      (acc, item) => ({
        cargoWeight: acc.cargoWeight + parseFloat(item.cargoWeight || 0),
        cbm: acc.cbm + parseFloat(item.cbm || 0),
        qtyManifest: acc.qtyManifest + parseInt(item.destuff || 0, 10),
      }),
      { cargoWeight: 0, cbm: 0, qtyManifest: 0 }
    );

    setFormData2((prev) => ({
      ...prev,
      totalCargoWeight: totals.cargoWeight.toFixed(3),
      totalCbm: totals.cbm.toFixed(3),
      totalQtyManifest: totals.qtyManifest.toString(),
    }));
  }, [formList]);

  // Helper functions
  const getInputType = (field) => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes("date")) return "text";
    if (
      lowerField.includes("number") ||
      lowerField.includes("weight") ||
      lowerField.includes("qty") ||
      lowerField.includes("cbm")
    )
      return "number";
    return "text";
  };

  const getValueName = (id, data) => {
    if (!id || !data) return "";
    const match = data.find((item) => item.id == id);
    return match ? match.name : "";
  };

  // Form handlers
  const addForm = () => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        id: Date.now(),
        consigneeName: "",
        blAwnNumber: "",
        blAwnDate: "",
        igmNo: "",
        igmDate: "",
        tpNo: "",
        tpDate: "",
        cargo: "",
        cargoWeight: "0.000",
        cbm: "0.000",
        packedIn: "",
        qtyManifest: "0",
        destuff: "0",
        "excess/short": "",
        marks: "",
        number: "",
        remarks: "",
        slNo: prevForms.length + 1,
      },
    ]);
  };

  const formatDateInput = (value) => {
    if (!value) return value;

    // Remove all non-digit characters
    let digits = value.replace(/\D/g, "");

    // Limit to 8 digits (DDMMYYYY)
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-insert dashes as DD-MM-YYYY
    if (digits.length >= 5) {
      return (
        digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4)
      );
    } else if (digits.length >= 3) {
      return digits.slice(0, 2) + "-" + digits.slice(2);
    }

    return digits;
  };

  const validateDateField = (dateStr, fieldName = "Date") => {
    if (!dateStr) return null;

    // Check if the input matches the complete date pattern
    if (dateStr.length === 10) {
      const isValidFormat =
        /^(0[1-9]|[12][0-9]|3[01])([-/.])(0[1-9]|1[0-2])\2\d{4}$/.test(dateStr);

      if (!isValidFormat) {
        return `${fieldName} must be in DD-MM-YYYY format`;
      }

      const separator = dateStr.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/)[2];
      const formatMap = {
        "-": "DD-MM-YYYY",
        "/": "DD/MM/YYYY",
        ".": "DD.MM.YYYY",
      };
      const format = formatMap[separator] || "DD-MM-YYYY";

      const inputDate = moment(dateStr, format, true);
      const currentDate = moment();

      if (!inputDate.isValid()) {
        return `Invalid ${fieldName}`;
      }

      if (inputDate.isAfter(currentDate, "day")) {
        return `${fieldName} cannot be in the future`;
      }
    } else if (dateStr.length > 0) {
      return "Please enter complete date in DD-MM-YYYY format";
    }

    return null;
  };

  const handleChange2 = (field, value) => {
    const upperValue = toUpperCase(value);
    const updatedFormData = { ...formData2, [field]: upperValue };
    setFormData2(updatedFormData);

    const errors = { ...formErrors };

    if (field === "forwarder1" || field === "forwarder2") {
      const forwarder1 =
        field === "forwarder1" ? upperValue : updatedFormData.forwarder1;
      const forwarder2 =
        field === "forwarder2" ? upperValue : updatedFormData.forwarder2;

      if (forwarder1 && forwarder2 && forwarder1 === forwarder2) {
        errors.forwarder2 = "Forwarder 1 and Forwarder 2 cannot be the same";
      } else {
        delete errors.forwarder2;
      }
    }

    setFormErrors(errors);
  };

  const handleChange = useCallback((index, field, value) => {
    // List of date fields
    const dateFields = ["blAwnDate", "igmDate", "tpDate"];
    const isDateField = dateFields.includes(field);

    let processedValue = value;

    if (isDateField) {
      // Format date as user types (DD-MM-YYYY)
      processedValue = formatDateInput(value);
    } else if (typeof value === "string") {
      // Convert all other string fields to uppercase
      processedValue = value.toUpperCase();
    }

    setFormList((prevForms) =>
      prevForms.map((form, i) => {
        if (i !== index) return form;

        const updatedForm = { ...form, [field]: processedValue };

        // Only validate date fields when fully entered (10 chars)
        if (isDateField && processedValue.length === 10) {
          const dateError = validateDateField(processedValue);
          if (dateError) {
            updatedForm[`${field}Error`] = dateError;
          } else {
            delete updatedForm[`${field}Error`];
          }
        }

        // Excess/Short calculation
        // if (field === "qtyManifest" || field === "destuff") {
        //   const qty = parseInt(updatedForm.qtyManifest || "0", 10);
        //   const destuff = parseInt(updatedForm.destuff || "0", 10);
        //   updatedForm["excessShort"] = (destuff - qty).toString();
        // }

        if (field === "qtyManifest" || field === "destuff") {
          const qty = updatedForm.qtyManifest;
          const destuff = updatedForm.destuff;

          // Check if both values are not empty and are valid numbers
          if (qty !== "" && destuff !== "" && !isNaN(qty) && !isNaN(destuff)) {
            const excessShort = parseInt(destuff) - parseInt(qty);
            updatedForm["excessShort"] = excessShort.toString();
          } else {
            updatedForm["excessShort"] = "";
          }
        }

        return updatedForm;
      })
    );
  }, []);

  const cancelForm = (index) => {
    setFormList((prevForms) =>
      prevForms
        .filter((_, i) => i !== index)
        .map((form, i) => ({
          ...form,
          slNo: i + 1,
        }))
    );
  };

  // Save handler
  const handleSave = async () => {
    const mandatoryFields = {
      destuffDate: "Destuff Date",
      yardName: "Yard Name",
      sealCuttingDate: "Seal Cutting Date",
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

    // Forwarder validation
    if (
      formData2.forwarder1 &&
      formData2.forwarder2 &&
      formData2.forwarder1 === formData2.forwarder2
    ) {
      toast.error("Forwarder 1 and Forwarder 2 must be different");
      setFormErrors((prev) => ({
        ...prev,
        forwarder2: "Forwarder 1 and Forwarder 2 must be different",
        forwarder1: "Forwarder 1 and Forwarder 2 must be different",
      }));
      return;
    }

    const inputDate = moment(formData.destuffDate, "DD-MM-YYYY", true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    if (!inputDate.isValid()) {
      toast.error("Invalid date format for Destuff Date");
      setFormErrors((prev) => ({
        ...prev,
        destuffDate: "Invalid date format (DD-MM-YYYY)",
      }));
      return;
    } else if (inputDate.isAfter(current)) {
      toast.error("Destuff Date cannot be in the future");
      setFormErrors((prev) => ({
        ...prev,
        destuffDate: "Date cannot be in the future",
      }));
      return;
    } else if (inputDate.isBefore(minimum)) {
      toast.error("Destuff Date cannot be more than 3 days in the past");
      setFormErrors((prev) => ({
        ...prev,
        destuffDate: "Date cannot be more than 3 days in the past",
      }));
      return;
    }

    // Validate cargo details dates
    let hasInvalidDates = false;
    const updatedFormList = formList.map((item) => {
      const newItem = { ...item };

      // Validate BL/AWN Date
      if (item.blAwnDate) {
        const error = validateDateField(item.blAwnDate, "BL/AWN Date");
        if (error) {
          newItem.blAwnDateError = error;
          hasInvalidDates = true;
        }
      }

      // Validate IGM Date
      if (item.igmDate) {
        const error = validateDateField(item.igmDate, "IGM Date");
        if (error) {
          newItem.igmDateError = error;
          hasInvalidDates = true;
        }
      }

      // Validate TP Date
      if (item.tpDate) {
        const error = validateDateField(item.tpDate, "TP Date");
        if (error) {
          newItem.tpDateError = error;
          hasInvalidDates = true;
        }
      }

      return newItem;
    });

    if (hasInvalidDates) {
      setFormList(updatedFormList);
      toast.error("Please correct the date errors in cargo details");
      return;
    }

    const formattedDestuffDate = moment(
      formData.destuffDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");
    setIsLoading(true);
    const errors = { ...formErrors };

    if (
      formData2.forwarder1 &&
      formData2.forwarder2 &&
      formData2.forwarder1 === formData2.forwarder2
    ) {
      errors.forwarder2 = "Forwarder 1 and Forwarder 2 cannot be the same";
    }

    // if (Object.keys(errors).length > 0) {
    //   setFormErrors(errors);
    //   Object.values(errors).forEach((error) => toast.error(error));
    //   setIsLoading(false);
    //   return;
    // }

    // Prepare payload
    const payload = {
      formData: {
        containerNumber: formData2.containerNumber || null,
        destuffDate: formattedDestuffDate,
        bookingNumber: formData2.bookingNumber || null,
        yardId: formData.yardName ? parseInt(formData2.yardName, 10) : null,
        forwarder1Id: formData2.forwarder1
          ? parseInt(formData2.forwarder1, 10)
          : null,
        forwarder2Id: formData2.forwarder2
          ? parseInt(formData2.forwarder2, 10)
          : null,
        consigneeName: formData2.nameOfConsignee || null,
        chaCodeName: formData2.chaCodeName || null,
        pod: formData2.pod || null,
        containerCondition: formData2.containerStatus || null,
        remarks: formData2.mainRemark,
        anyOtherRemarks: formData2.anyOtherRemarks || null,
        totalCargoWeight: formData2.totalCargoWeight
          ? parseFloat(formData2.totalCargoWeight)
          : null,
        totalCBM: formData2.totalCbm ? parseFloat(formData2.totalCbm) : null,
        totalQtyManifest: formData2.totalQtyManifest
          ? parseInt(formData2.totalQtyManifest, 10)
          : null,
        operation: "Loading",
        seal_no:
          Number(formData.seal_no) ||
          Number(previousPageData.seal_no) ||
          Number(formData2.seal_no),
        shippingLineId: formData2.shippingLineId
          ? parseInt(formData2.shippingLineId, 10)
          : null,
        size: formData2.size || null,
        type: formData2.type || null,
        tareWeight: formData2.tareWeight || null,
        mgWeight: formData2.mgWeight || null,
        mfdDate: formData2.mfdDate || null,
        request_type: 1,
        cscValidity: formData2.cscValidity
          ? moment(formData2.cscValidity).format("YYYY-MM-DD")
          : null,
        seal_cutting_date: formData.sealCuttingDate
          ? moment(formData.sealCuttingDate, "DD-MM-YYYY").format("YYYY-MM-DD")
          : null,
      },
      formList: formList.map((item) => ({
        slNo: item.slNo,
        blAwnNumber: item.blAwnNumber || "",
        blAwnDate:
          moment(item.blAwnDate, "DD-MM-YYYY").format("YYYY-MM-DD") || "",
        cargo: item.cargo,
        cargoWeight: parseFloat(item.cargoWeight),
        cbm: parseFloat(item.cbm),
        packedIn: item.packedIn,
        qtyManifest: parseInt(item.qtyManifest, 10),
        destuff: parseInt(item.destuff, 10),
        excessShort: item.excessShort || item["excess/short"] || "",
        marks: item.marks,
        number: item.number,
        remarks: item.remarks,
        tpNumber: item.tpNo || "",
        tpDate: moment(item.tpDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
        igmNumber: item.igmNo || "",
        igmDate: moment(item.igmDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
        consignee_name: item.consigneeName || "",
      })),
    };

    console.log("Data::", previousPageData);

    try {
      const response = await operationService.createDestuffLCL(payload);
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED DESTUFFING-LCL OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
        );
        localStorage.setItem("operation", 4);
        navigate(`/app/operation/Admin`, {
          state: {
            containerData: containerData,
            operation: selectedOperation,
          },
        });
      } else {
        toast.error(response.message || "Failed to create Destuff LCL");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(error.message || "An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestuffDateChange = (e) => {
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

    // Update the form data with formatted value
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate only when we have a complete date (DD-MM-YYYY)
    if (value.length === 10) {
      const dateParts = value.split("-");
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);

      // Basic date validation
      const isValidDate = (d, m, y) => {
        const date = new Date(y, m - 1, d);
        return (
          date.getFullYear() === y &&
          date.getMonth() === m - 1 &&
          date.getDate() === d
        );
      };

      // Get current date in DD-MM-YYYY format
      const currentDateFormatted = moment().format("DD-MM-YYYY");
      const minAllowedDateFormatted = moment()
        .subtract(3, "days")
        .format("DD-MM-YYYY");

      // Format arrival date if available
      const arrivalDateFormatted = arrivalDate
        ? moment(arrivalDate).format("DD-MM-YYYY")
        : null;

      // Validation checks
      if (!isValidDate(day, month, year)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Please enter a valid date",
        }));
      } else if (moment(value, "DD-MM-YYYY").isAfter(moment())) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be in the future",
        }));
      } else if (
        moment(value, "DD-MM-YYYY").isBefore(
          moment(minAllowedDateFormatted, "DD-MM-YYYY")
        )
      ) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be more than 3 days in the past",
        }));
      } else if (
        arrivalDateFormatted &&
        moment(value, "DD-MM-YYYY").isBefore(
          moment(arrivalDateFormatted, "DD-MM-YYYY")
        )
      ) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: `Date cannot be before Arrival Date (${arrivalDateFormatted})`,
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else if (value.length > 0 && value.length < 10) {
      // Show error if partially entered date
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Please enter complete date in DD-MM-YYYY format",
      }));
    } else {
      // Clear errors if field is empty
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleDateChange = (e) => {
    let { name, value } = e.target;

    // Remove all non-digit characters
    value = value.replace(/\D/g, "");

    // Auto-format as user types (DD-MM-YYYY)
    if (value.length > 2 && value.length <= 4) {
      value = `${value.slice(0, 2)}-${value.slice(2)}`;
    } else if (value.length > 4) {
      value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 8)}`;
    }

    // Update the form data with formatted value
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate only when we have a complete date (DD-MM-YYYY)
    if (value.length === 10) {
      // Parse dates using strict mode (must match exact format)
      const inputDate = moment(value, "DD-MM-YYYY", true);
      const destuffDate = moment(formData.destuffDate, "DD-MM-YYYY", true);

      // Basic validation checks
      if (!inputDate.isValid()) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Please enter a valid date in DD-MM-YYYY format",
        }));
      } else if (inputDate.isAfter(moment(), "day")) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Seal cutting date cannot be in the future",
        }));
      } else if (
        destuffDate.isValid() &&
        inputDate.isAfter(destuffDate, "day")
      ) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: `Seal cutting date cannot be after destuff date (${formData.destuffDate})`,
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else if (value.length > 0 && value.length < 10) {
      // Show error if partially entered date
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Please enter complete date in DD-MM-YYYY format",
      }));
    } else {
      // Clear errors if field is empty
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Destuffing of LCL Container"
        parent="Apps"
        title="Destuffing of LCL Container"
      />

      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={() => {}}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={containerData}
                disabled={true}
              />

              <Table bordered responsive className="mt-4">
                <thead className="table-secondary">
                  <tr>
                    <th>Forwarder1 Code</th>
                    <th>Forwarder2 Code</th>
                    <th>Arrival Date</th>
                    <th>Booking Number</th>
                    <th>Yard</th>
                    <th>ICD</th>
                    <th>Seal No.</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {getValueName(
                        operationFromStorage === "5"
                          ? previousPageData?.forwarder1Id
                          : previousPageData?.forwarder1_id,
                        forwarders
                      )}
                    </td>
                    <td>
                      {getValueName(
                        operationFromStorage === "5"
                          ? previousPageData?.forwarder2Id
                          : previousPageData?.forwarder2_id,
                        forwarders
                      )}
                    </td>
                    <td>{moment(arrivalDate).format("DD-MM-YYYY") || null}</td>
                    <td>
                      {operationFromStorage === "5"
                        ? previousPageData?.bookingNumber
                        : previousPageData?.booking_number}
                    </td>
                    <td>
                      {getValueName(
                        operationFromStorage === "5"
                          ? previousPageData?.yardId
                          : previousPageData?.yard_id,
                        yards
                      )}
                    </td>
                    <td>{getValueName(previousPageData?.icds, icds)}</td>
                    <td>{previousPageData?.seal_no}</td>
                    <td>{previousPageData?.remarks}</td>
                  </tr>
                </tbody>
              </Table>

              <ContainerDetailsSection
                formData={formData2}
                handleChange={handleChange2}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={containerData}
                disabled={false}
              />

              <div className="shadow-sm p-4 mt-4 rounded">
                <Row className="mb-5 mt-2">
                  <Col md="6">
                    <label htmlFor="">Forwarder1 Code Name</label>
                    <select
                      name="forwarder1"
                      className="form-select form-select-sm"
                      onChange={(e) =>
                        handleChange2("forwarder1", e.target.value)
                      }
                      value={formData2.forwarder1}
                    >
                      <option value="">Select Forwarder1</option>
                      {forwardersLoading ? (
                        <option>Loading...</option>
                      ) : (
                        forwarders
                          .filter((res) => res.category === "forwarder")
                          .map((fwd) => (
                            <option key={fwd.id} value={String(fwd.id)}>
                              {fwd.name}
                            </option>
                          ))
                      )}
                    </select>
                  </Col>
                  <Col md="6">
                    <label htmlFor="">Forwarder2 Code Name</label>
                    <select
                      name="forwarder2"
                      className="form-select form-select-sm"
                      onChange={(e) =>
                        handleChange2("forwarder2", e.target.value)
                      }
                      value={formData2.forwarder2}
                    >
                      <option value="">Select Forwarder2</option>
                      {forwardersLoading ? (
                        <option>Loading...</option>
                      ) : (
                        forwarders
                          .filter((res) => res.category === "forwarder")
                          .map((fwd) => (
                            <option key={fwd.id} value={String(fwd.id)}>
                              {fwd.name}
                            </option>
                          ))
                      )}
                    </select>
                    {formErrors.forwarder2 && (
                      <span className="text-danger">
                        {formErrors.forwarder2}
                      </span>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3 mt-4">
                  <Col md="4">
                    <label>
                      Destuff Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="destuffDate"
                      type="text"
                      className={`form-control ${
                        formErrors.destuffDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDestuffDateChange}
                      value={formData.destuffDate || ""}
                      placeholder="DD-MM-YYYY"
                    />
                    {formErrors.destuffDate && (
                      <span className="text-danger">
                        {formErrors.destuffDate}
                      </span>
                    )}
                  </Col>

                  <Col md="4">
                    <label htmlFor="">
                      Seal Cutting Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="sealCuttingDate"
                      className={`form-control ${
                        formErrors.sealCuttingDate ? "is-invalid" : ""
                      }`}
                      placeholder="DD-MM-YYYY"
                      onChange={handleDateChange}
                      value={formData.sealCuttingDate || ""}
                    />
                    {formErrors.sealCuttingDate && (
                      <span className="text-danger">
                        {formErrors.sealCuttingDate}
                      </span>
                    )}
                  </Col>

                  <Col md="4">
                    <label htmlFor="">Booking Number</label>
                    <input
                      name="bookingNumber"
                      className="form-control"
                      placeholder="Booking Number"
                      onChange={(e) =>
                        handleChange2("bookingNumber", e.target.value)
                      }
                      value={formData2.bookingNumber}
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
                      name="yardName"
                      className="form-select"
                      onChange={(e) =>
                        handleChange2("yardName", e.target.value)
                      }
                      value={formData.yardName}
                    >
                      <option value="">Select Yard</option>
                      {yardsLoading ? (
                        <option>Loading...</option>
                      ) : (
                        yards.map((yard) => (
                          <option key={yard.id} value={yard.id}>
                            {yard.name}
                          </option>
                        ))
                      )}
                    </select>
                  </Col>
                  <Col md="4">
                    <label htmlFor="">CHA Code Name</label>
                    <input
                      name="chaCodeName"
                      className="form-control"
                      placeholder="CHA Code Name"
                      onChange={(e) =>
                        handleChange2("chaCodeName", e.target.value)
                      }
                      value={formData2.chaCodeName}
                    />
                  </Col>
                  <Col md="4">
                    <label htmlFor="">POD</label>
                    <input
                      name="pod"
                      type="text"
                      className="form-control"
                      placeholder="POD..."
                      onChange={(e) => handleChange2("pod", e.target.value)}
                      value={formData2.pod}
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
                      onChange={(e) =>
                        handleChange2("containerStatus", e.target.value)
                      }
                      value={formData2.containerStatus}
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
                      onChange={(e) =>
                        handleChange2("mainRemark", e.target.value)
                      }
                      value={formData2.mainRemark}
                      placeholder="Remarks"
                    ></textarea>
                  </Col>
                  <Col md="6">
                    <label htmlFor="">Any Other Remarks</label>
                    <textarea
                      name="anyOtherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={(e) =>
                        handleChange2("anyOtherRemarks", e.target.value)
                      }
                      value={formData2.anyOtherRemarks}
                      placeholder="Any Other Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 mt-4 rounded">
                <div className="mb-3">
                  <div className="mb-3 d-flex align-items-center gap-3">
                    <button className="btn btn-primary" onClick={addForm}>
                      Proceed to enter Cargo Detail
                    </button>
                    <div className="badge bg-success text-white p-3 fs-6">
                      Total: {formList.length}
                    </div>
                  </div>

                  {formList.map((form, index) => (
                    <div key={form.id} className="mt-4 p-4 border rounded">
                      <h3 className="font-semibold mb-2">
                        Cargo Detail - SL No: {form.slNo}
                      </h3>
                      <div className="row">
                        {FIELDS_CONFIG.map(({ name, label }) => (
                          <div key={name} className="col-md-4 mb-2">
                            <label className="form-label">{label}</label>
                            <input
                              type={getInputType(name)}
                              value={form[name]}
                              onChange={(e) =>
                                handleChange(index, name, e.target.value)
                              }
                              className={`form-control ${
                                form[`${name}Error`] ? "is-invalid" : ""
                              }`}
                              readOnly={name === "excessShort"}
                              style={
                                getInputType(name) === "number"
                                  ? { appearance: "textfield" }
                                  : {}
                              }
                              placeholder={
                                getInputType(name) === "text" &&
                                name.toLowerCase().includes("date")
                                  ? "DD-MM-YYYY"
                                  : ""
                              }
                            />
                            {form[`${name}Error`] && (
                              <span className="text-danger">
                                {form[`${name}Error`]}
                              </span>
                            )}
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

              <h5 className="mb-3 mt-4">Total Calculated Values</h5>
              <Row className="mb-3">
                <Col md="4">
                  <label htmlFor="">Total Cargo Weight</label>
                  <input
                    name="totalCargoWeight"
                    className="form-control"
                    placeholder="Total Cargo Weight"
                    value={formData2.totalCargoWeight}
                    readOnly
                  />
                </Col>
                <Col md="4">
                  <label htmlFor="">Total CBM</label>
                  <input
                    name="totalCbm"
                    className="form-control"
                    placeholder="Total CBM"
                    value={formData2.totalCbm}
                    readOnly
                  />
                </Col>
                <Col md="4">
                  <label htmlFor="">Total Qty Manifest</label>
                  <input
                    name="totalQtyManifest"
                    className="form-control"
                    placeholder="Total Quantity Manifest"
                    value={formData2.totalQtyManifest}
                    readOnly
                  />
                </Col>
              </Row>

              <div className="text-center mt-4">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default DestuffLclContainer;
