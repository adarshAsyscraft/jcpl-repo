import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";

import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Table } from "reactstrap";
import { Col, Container, Label, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";

const DestuffLclRequest = () => {
  // Hooks and context
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State initialization
  const [formList, setFormList] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [arrivalData, setArrivalData] = useState(null);
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const selectedOperation = location.state?.operation;
  const initialContainerData = location.state?.containerData || null;
  const [containerData, setContainerData] = useState(initialContainerData);

  // Redux selectors
  const { fetchedContainer } = useSelector((state) => state.container);
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  const { data: containerTypes = [], loading: containerTypesLoading } =
    useSelector((state) => state.containerTypes || {});
  const { data: yards = [], loading: yardsLoading } = useSelector(
    (state) => state.yards || {}
  );
  const transportersState = useSelector((state) => state.transporters);
  const transporters = transportersState?.data || [];

  // Form data initialization
  const initialFormData = useMemo(
    () => ({
      containerNumber: "",
      shippingLineId: "",
      size: "",
      type: "",
      tareWeight: "",
      mgWeight: "",
      mfdDate: "",
      cscValidity: "",
      remarks: "",
      operation: selectedOperation || "",
      forwarder1: "",
      forwarder2: "",
      transportMode: "",
      yardName: "",
      loadStatus: "",
      destuffDate: "",
      totalCargoWeight: "0.000",
      totalCbm: "0.000",
      totalQtyManifest: "0",
      containerRemarks: "",
      seal_no: "",
    }),
    [selectedOperation]
  );

  const initialFormData2 = useMemo(
    () => ({
      ...initialFormData,
      bookingNumber: "",
      nameOfConsignee: "",
      chaCodeName: "",
      sealCuttingDate: "",
      containerStatus: "",
      containerRemarks: "",
      anyOtherRemarks: "",
      pod: "",
    }),
    [initialFormData]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [formData2, setFormData2] = useState(initialFormData2);

  // Fields configuration for dynamic form
  const fieldsConfig = useMemo(
    () => [
      { name: "consigneeName", label: "Consignee Name" },
      { name: "bl/AwnNumber", label: "BL/AWN Number" },
      { name: "blAwnDate", label: "BL/AWN Date", type: "date" },
      { name: "igmNo", label: "IGM No" },
      { name: "igmDate", label: "IGM Date", type: "date" },
      { name: "tpNo", label: "TP No" },
      { name: "tpDate", label: "TP Date", type: "date" },
      { name: "cargo", label: "Cargo" },
      {
        name: "cargoWeight (in kg)",
        label: "Cargo Weight (in kg)",
        type: "number",
      },
      { name: "cbm", label: "CBM", type: "number" },
      { name: "packedIn", label: "Packed In" },
      { name: "qtyManifest", label: "Qty Manifest", type: "number" },
      { name: "destuff", label: "Destuff", type: "number" },
      { name: "excess/short", label: "Excess/Short", readOnly: true },
      { name: "marks", label: "Marks" },
      { name: "number", label: "Number" },
      { name: "remarks", label: "Remarks" },
    ],
    []
  );

  // Data fetching effects
  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());
    if (containerNumber) {
      dispatch(fetchContainerByNumber(containerNumber));
    }
  }, [dispatch, containerNumber]);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, [
    containerNumber,
    containerData,
    dispatch,
    location,
    navigate,
    selectedOperation,
  ]);

  // Initialize form data when container data is available
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

      setFormData((prev) => ({ ...prev, ...commonData }));
      setFormData2((prev) => ({ ...prev, ...commonData }));
    }
  }, [containerData, selectedOperation]);

  // Fetch arrival data
  const getPreviousContainerDetails = useCallback(async () => {
    try {
      const res = await operationService.arrivalContainer(containerNumber);
      if (res.success) {
        setArrivalData(res.data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch arrival data");
    }
  }, [containerNumber]);

  useEffect(() => {
    getPreviousContainerDetails();
  }, [getPreviousContainerDetails]);

  // Update form data when arrival data is available
  useEffect(() => {
    if (arrivalData) {
      setFormData2((prev) => ({
        ...prev,
        forwarder1: arrivalData.forwarder1_id || "",
        forwarder2: arrivalData.forwarder2_id || "",
        yardName: arrivalData.yard_id || "",
        containerCondition: arrivalData.container_condition || "",
        containerStatus: arrivalData.container_status || "",
        bookingNumber: arrivalData.booking_number || "",
        containerRemarks: arrivalData.remarks || "",
        seal_no: arrivalData.seal_no || "",
      }));
    }
  }, [arrivalData]);

  // Form list handlers
  const addForm = useCallback(() => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        id: Date.now(),
        consigneeName: "",
        "bl/AwnNumber": "",
        blAwnDate: "",
        igmNo: "",
        igmDate: "",
        tpNo: "",
        tpDate: "",
        cargo: "",
        "cargoWeight (in kg)": "0.000",
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
  }, []);

  const cancelForm = useCallback((index) => {
    setFormList((prevForms) =>
      prevForms
        .filter((_, i) => i !== index)
        .map((form, i) => ({
          ...form,
          slNo: i + 1,
        }))
    );
  }, []);

  const toUpperCase = (value) => {
    if (typeof value === "string") {
      return value.toUpperCase();
    }
    return value;
  };

  // Field change handlers
  const handleChange1 = () => {};

  // const handleChange2 = useCallback((field, value) => {

  //   setFormData2((prev) => {
  //     const updated = { ...prev, [field]: value };

  //     // Clear error if exists
  //     setFormErrors((errors) => ({ ...errors, [field]: undefined }));

  //     // Special validation only for forwarders
  //     if (field === "forwarder1" || field === "forwarder2") {
  //       if (
  //         (field === "forwarder1" && value === prev.forwarder2) ||
  //         (field === "forwarder2" && value === prev.forwarder1)
  //       ) {
  //         setFormErrors((prev) => ({
  //           ...prev,
  //           forwarder2: "Forwarder 1 and Forwarder 2 cannot be the same",
  //         }));
  //       }
  //     }

  //     return updated;
  //   });
  // }, []);

  const handleChange2 = useCallback((field, value) => {
    const upperValue = toUpperCase(value);

    setFormData2((prev) => {
      const updated = { ...prev, [field]: upperValue };

      // Clear error if exists
      setFormErrors((errors) => ({ ...errors, [field]: undefined }));

      // Special validation only for forwarders
      if (field === "forwarder1" || field === "forwarder2") {
        if (
          (field === "forwarder1" && upperValue === prev.forwarder2) ||
          (field === "forwarder2" && upperValue === prev.forwarder1)
        ) {
          setFormErrors((prev) => ({
            ...prev,
            forwarder2: "Forwarder 1 and Forwarder 2 cannot be the same",
          }));
        }
      }

      return updated;
    });
  }, []);

  // const handleChange = useCallback((index, field, value) => {
  //   setFormList((prevForms) =>
  //     prevForms.map((form, i) => {
  //       if (i !== index) return form;

  //       const updatedForm = { ...form, [field]: value };

  //       // Date validation for fields with "date" in name
  //       if (field.toLowerCase().includes("date")) {
  //         const isValidFormat =
  //           /^(0[1-9]|[12][0-9]|3[01])([-/.])(?:0[1-9]|1[0-2])\2\d{4}$/.test(
  //             value
  //           );
  //         const matched = value.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
  //         const separator = matched?.[2];
  //         const formatMap = {
  //           "-": "DD-MM-YYYY",
  //           "/": "DD/MM/YYYY",
  //           ".": "DD.MM.YYYY",
  //         };

  //         const inputDate = moment(value, formatMap[separator], true);
  //         const current = moment(currentDate, "DD-MM-YYYY");
  //         const minimum = moment(minAllowedDate, "YYYY-MM-DD");

  //         if (!value) {
  //           updatedForm[`${field}Error`] = "Date is required";
  //         } else if (!isValidFormat || !inputDate.isValid()) {
  //           updatedForm[`${field}Error`] = "Invalid date format";
  //         } else if (inputDate.isAfter(current)) {
  //           updatedForm[`${field}Error`] = "Date cannot be in the future";
  //         } else if (inputDate.isBefore(minimum)) {
  //           updatedForm[`${field}Error`] =
  //             "Date cannot be more than 3 days in the past";
  //         } else {
  //           updatedForm[`${field}Error`] = undefined;
  //         }
  //       }

  //       // Excess/Short logic
  //       if (field === "qtyManifest" || field === "destuff") {
  //         const qty = parseInt(updatedForm.qtyManifest || "0", 10);
  //         const destuff = parseInt(updatedForm.destuff || "0", 10);
  //         updatedForm["excess/short"] = (destuff - qty).toString();
  //       }

  //       return updatedForm;
  //     })
  //   );
  // }, []);

  // Calculate totals whenever formList changes

  const handleChange = useCallback((index, field, value) => {
    const upperValue = toUpperCase(value);

    setFormList((prevForms) =>
      prevForms.map((form, i) => {
        if (i !== index) return form;

        const updatedForm = { ...form, [field]: upperValue };

        // Date validation for fields with "date" in name
        if (field.toLowerCase().includes("date")) {
          const isValidFormat =
            /^(0[1-9]|[12][0-9]|3[01])([-/.])(?:0[1-9]|1[0-2])\2\d{4}$/.test(
              upperValue
            );
          const matched = upperValue.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
          const separator = matched?.[2];
          const formatMap = {
            "-": "DD-MM-YYYY",
            "/": "DD/MM/YYYY",
            ".": "DD.MM.YYYY",
          };

          const inputDate = moment(upperValue, formatMap[separator], true);
          const current = moment(currentDate, "DD-MM-YYYY");
          const minimum = moment(minAllowedDate, "YYYY-MM-DD");

          if (!upperValue) {
            updatedForm[`${field}Error`] = "Date is required";
          } else if (!isValidFormat || !inputDate.isValid()) {
            updatedForm[`${field}Error`] = "Invalid date format";
          } else {
            updatedForm[`${field}Error`] = undefined;
          }
        }

        // Excess/Short logic
        if (field === "qtyManifest" || field === "destuff") {
          const qty = parseInt(updatedForm.qtyManifest || "0", 10);
          const destuff = parseInt(updatedForm.destuff || "0", 10);
          updatedForm["excess/short"] = (destuff - qty).toString();
        }

        return updatedForm;
      })
    );
  }, []);

  useEffect(() => {
    const totals = formList.reduce(
      (acc, item) => ({
        cargoWeight:
          acc.cargoWeight + parseFloat(item["cargoWeight (in kg)"] || 0),
        cbm: acc.cbm + parseFloat(item.cbm || 0),
        qtyManifest: acc.qtyManifest + parseInt(item.destuff || 0, 10),
      }),
      { cargoWeight: 0, cbm: 0, qtyManifest: 0 }
    );

    setFormData((prev) => ({
      ...prev,
      totalCargoWeight: totals.cargoWeight.toFixed(3),
      totalCbm: totals.cbm.toFixed(3),
      totalQtyManifest: totals.qtyManifest.toString(),
    }));
  }, [formList]);

  // Helper function to get display name from ID
  const getValueName = useCallback((id, data) => {
    const match = data?.find((item) => item.id === id);
    return match ? match.name : "";
  }, []);

  const formatDateField = (dateStr) => {
    if (!dateStr) return "";

    const matched = dateStr.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
    if (!matched) return "";

    const separator = matched[2];
    const formatMap = {
      "-": "DD-MM-YYYY",
      "/": "DD/MM/YYYY",
      ".": "DD.MM.YYYY",
    };

    const format = formatMap[separator] || "DD-MM-YYYY";

    const momentObj = moment(dateStr, format, true);
    return momentObj.isValid() ? momentObj.format("YYYY-MM-DD") : "";
  };

  // Form submission
  const handleSave = useCallback(async () => {
    const errors = {};

    const formattedDestuffDate = moment(
      formData.destuffDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    // Validate forwarders
    if (
      formData2.forwarder1 &&
      formData2.forwarder2 &&
      formData2.forwarder1 === formData2.forwarder2
    ) {
      errors.forwarder2 = "Forwarder 1 and Forwarder 2 cannot be the same";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    const payload = {
      formData: {
        containerNumber: formData2.containerNumber,
        destuffDate: formattedDestuffDate,
        bookingNumber: formData2.bookingNumber,
        yardId: Number(formData2.yardName),
        forwarder1Id: Number(formData2.forwarder1),
        forwarder2Id: Number(formData2.forwarder2),
        consigneeName: formData2.nameOfConsignee,
        chaCodeName: formData2.chaCodeName,
        pod: formData2.pod,
        containerCondition:
          formData2.containerCondition || formData2.containerStatus,
        remarks: formData2.containerRemarks,
        anyOtherRemarks: formData2.anyOtherRemarks,
        totalCargoWeight: Number(formData.totalCargoWeight),
        totalCBM: Number(formData.totalCbm),
        totalQtyManifest: Number(formData.totalQtyManifest),
        operation: formData2.operation,
        seal_no: Number(arrivalData.seal_no),
        size: formData2.size,
        type: formData2.type,
        tareWeight: formData2.tareWeight,
        mgWeight: formData2.mgWeight,
        mfdDate: formData2.mfdDate,
        cscValidity: formData2.cscValidity
          ? moment(formData2.cscValidity).format("YYYY-MM-DD")
          : "",
        request_type: 2,
        seal_cutting_date:
          formatDateField(formData2.sealCuttingDate) ||
          moment().format("YYYY-MM-DD"),
      },

      formList: formList.map((item) => {
        const formattedItem = {
          slNo: item.slNo,
          blAwnNumber: item["blAwnNumber"] || item["bl/AwnNumber"] || "",
          blAwnDate: formatDateField(item.blAwnDate),
          cargo: item.cargo,
          cargoWeight: parseFloat(
            item["cargoWeight"] || item["cargoWeight (in kg)"]
          ),
          cbm: parseFloat(item.cbm),
          packedIn: item.packedIn,
          qtyManifest: parseInt(item.qtyManifest, 10),
          destuff: parseInt(item.destuff, 10),
          excessShort: item.excessShort || item["excess/short"] || "",
          marks: item.marks,
          number: item.number,
          remarks: item.remarks,
          tpNumber: item.tpNumber || item.tpNo || "",
          tpDate: formatDateField(item.tpDate),
          igmNumber: item.igmNumber || item.igmNo || "",
          igmDate: formatDateField(item.igmDate),
          consignee_name: item.consigneeName || "",
        };

        return formattedItem;
      }),
    };

    try {
      const response = await operationService.createDestuffLCLRequest(payload);
      if (response.success) {
        localStorage.setItem("operation", 5);
        navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED DESTUFFING-LCL REQUEST OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
        );
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.message || "Failed to create request");
    }
    console.log("Patload::", payload);
  }, [formData, formData2, formList, currentDate, minAllowedDate, navigate]);

  // Get input type based on field name
  const getInputType = useCallback((field) => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes("date")) return "text"; // force text for date fields
    if (
      lowerField.includes("number") ||
      lowerField.includes("weight") ||
      lowerField.includes("qty") ||
      lowerField.includes("cbm")
    )
      return "number";
    return "text";
  }, []);

  const handleDestuffRequestDateChange = (e) => {
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
        [name]: "Destuff Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setFormErrors((prev) => ({
        ...prev,
        [name]:
          "Destuff Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (inputDate.isAfter(current)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Destuff Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Destuff Date cannot be more than 3 days in the past",
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  console.log("Arrival Data::", arrivalData);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Destuffing of LCL Request Container"
        parent="Apps"
        title="Destuffing of LCL Request Container"
      />

      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              {/* Container Details Sections */}
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange1}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />

              {/* Arrival Data Table */}
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
                      {getValueName(arrivalData?.forwarder1_id, forwarders)}
                    </td>
                    <td>
                      {getValueName(arrivalData?.forwarder2_id, forwarders)}
                    </td>
                    <td>
                      {moment(arrivalData?.arraival_date).format(
                        "DD-MM-YYYY"
                      ) || null}
                    </td>
                    <td>{arrivalData?.booking_number}</td>
                    <td>{getValueName(arrivalData?.yard_id, yards)}</td>
                    <td>{getValueName(arrivalData?.icds)}</td>
                    <td>{arrivalData?.seal_no}</td>
                    <td>{arrivalData?.remarks}</td>
                  </tr>
                </tbody>
              </Table>

              <ContainerDetailsSection
                formData={formData2}
                handleChange={handleChange2}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={fetchedContainer}
                disabled={false}
              />

              {/* Form Sections */}
              <div className="shadow-sm p-4 mt-4 rounded">
                <Row className="mb-3">
                  <Col md="6">
                    <label>Forwarder1 Code Name</label>
                    <select
                      name="forwarder1"
                      className="form-select form-select-sm"
                      onChange={(e) =>
                        handleChange2("forwarder1", e.target.value)
                      }
                      value={
                        formData2.forwarder1 || arrivalData?.forwarder1_id || ""
                      }
                    >
                      <option value="">Select Forwarder1</option>
                      {forwarders
                        .filter((res) => res.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={String(fwd.id)}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                  <Col md="6">
                    <label>Forwarder2 Code Name</label>
                    <select
                      name="forwarder2"
                      className="form-select form-select-sm"
                      onChange={(e) =>
                        handleChange2("forwarder2", e.target.value)
                      }
                      value={
                        formData2.forwarder2 || arrivalData?.forwarder2_id || ""
                      }
                    >
                      <option value="">Select Forwarder2</option>
                      {forwarders
                        .filter((res) => res.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={String(fwd.id)}>
                            {fwd.name}
                          </option>
                        ))}
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
                    <label>Destuff Request Date</label>
                    <input
                      name="destuffDate"
                      type="text"
                      className={`form-control ${
                        formErrors.destuffDate ? "is-invalid" : ""
                      }`}
                      onChange={handleDestuffRequestDateChange}
                      value={formData.destuffDate} // 👈 fixed here
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="DD-MM-YYYY"
                    />

                    {formErrors.destuffDate && (
                      <span className="text-danger">
                        {formErrors.destuffDate}
                      </span>
                    )}
                  </Col>

                  <Col md="4">
                    <label>Booking Number</label>
                    <input
                      name="bookingNumber"
                      className="form-control"
                      placeholder="Booking Number"
                      onChange={(e) =>
                        handleChange2("bookingNumber", e.target.value)
                      }
                      value={
                        formData2.bookingNumber ||
                        arrivalData?.booking_number ||
                        ""
                      }
                    />
                  </Col>
                  <Col md="4">
                    <label>Yard Name</label>
                    <select
                      name="yardName"
                      className="form-select"
                      onChange={(e) =>
                        handleChange2("yardName", e.target.value)
                      }
                      value={formData2.yardName || arrivalData?.yard_id || ""}
                    >
                      <option value="">Select Yard</option>
                      {yards.map((yard) => (
                        <option key={yard.id} value={yard.id}>
                          {yard.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>CHA Code Name</label>
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
                  <Col md="6">
                    <label>POD</label>
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

              {/* Container Condition Section */}
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
                    <label>Remarks</label>
                    <textarea
                      name="containerRemarks"
                      className="form-control"
                      rows="3"
                      onChange={(e) =>
                        handleChange2("containerRemarks", e.target.value)
                      }
                      value={formData2.containerRemarks}
                      placeholder="Remarks"
                    />
                  </Col>
                  <Col md="6">
                    <label>Any Other Remarks</label>
                    <textarea
                      name="anyOtherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={(e) =>
                        handleChange2("anyOtherRemarks", e.target.value)
                      }
                      value={formData2.anyOtherRemarks}
                      placeholder="Any Other Remarks"
                    />
                  </Col>
                </Row>
              </div>

              {/* Cargo Details Section */}
              <div className="shadow-sm p-4 mt-4 rounded">
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
                      {fieldsConfig.map(({ name, label }) => (
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
                            readOnly={name === "excess/short"}
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

              {/* Totals Section */}
              <h5 className="mb-3 mt-4">Total Calculated Values</h5>
              <Row className="mb-3">
                <Col md="4">
                  <label>Total Cargo Weight</label>
                  <input
                    name="totalCargoWeight"
                    className="form-control"
                    placeholder="Total Cargo Weight"
                    value={formData.totalCargoWeight}
                    readOnly
                  />
                </Col>
                <Col md="4">
                  <label>Total CBM</label>
                  <input
                    name="totalCbm"
                    className="form-control"
                    placeholder="Total CBM"
                    value={formData.totalCbm}
                    readOnly
                  />
                </Col>
                <Col md="4">
                  <label>Total Qty Manifest</label>
                  <input
                    name="totalQtyManifest"
                    className="form-control"
                    placeholder="Total Quantity Manifest"
                    value={formData.totalQtyManifest}
                    readOnly
                  />
                </Col>
              </Row>

              {/* Submit Button */}
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

export default DestuffLclRequest;
