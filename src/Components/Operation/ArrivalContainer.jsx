import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Label, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchYards } from "../../Redux/slices/yardSlice";
import {
  arrivalContainer,
  fetchContainerByNumber,
  getPrefillData,
} from "../../Redux/slices/containerSlice";
import { createArrivalContainer } from "../../Redux/slices/arrivalContainerSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import ContainerDetailsSection from "./containerDetails";
import { Select } from "antd";
import moment from "moment";
const { Option } = Select;

const ArrivalContainer = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state selectors
  const { fetchedContainer, prefillData } = useSelector(
    (state) => state.container
  );
  const transportersState = useSelector((state) => state.transporters);
  const forwardersState = useSelector((state) => state.forwarders || {});
  const containerTypesState = useSelector(
    (state) => state.containerTypes || {}
  );
  const yardsState = useSelector((state) => state.yards || {});

  // Extracted data
  const transporters = transportersState?.data || [];
  const forwarders = forwardersState?.data || [];
  const containerTypes = containerTypesState?.data || [];
  const yards = yardsState?.data || [];

  // State variables
  const [errors, setErrors] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const selectedOperation = location.state?.operation || "1";

  // Initial form state
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
      operation: selectedOperation,
      forwarder1Id: "",
      forwarder2Id: "",
      transportMode: "",
      yardId: "",
      pol: "",
      otherRemarks: "",
      loadStatus: "",
      arraival_date: "",
      bookingNumber: "",
      transporter: "",
      wagonNumber: "",
      trainTruckNumber: "",
      custom: "",
      other: "",
      sealNo: "",
      shipline: "",
      other_description: "",
      containerStatus: "",
      containerRemarks: "",
    }),
    [selectedOperation]
  );

  const [formData, setFormData] = useState(initialFormData);

  // Reset form when containerNumber changes (for new container)
  useEffect(() => {
    setFormData(initialFormData);
  }, [containerNumber, initialFormData]);

  // Initialize data fetching
  // useEffect(() => {
  //   dispatch(fetchForwarders());
  //   dispatch(fetchContainerTypes());
  //   dispatch(fetchYards());
  //   dispatch(fetchTransporters());
  //   if (containerNumber) {
  //     dispatch(fetchContainerByNumber(containerNumber));
  //     dispatch(getPrefillData(containerNumber));
  //   }
  // }, [dispatch, containerNumber]);

  // Initialize data fetching
  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());

    if (containerNumber) {
      // Reset form before fetching new data
      setFormData(initialFormData);
      dispatch(fetchContainerByNumber(containerNumber));
      dispatch(getPrefillData(containerNumber));
    } else {
      // Ensure form is empty for new containers
      setFormData(initialFormData);
    }
  }, [dispatch, containerNumber]);

  // Update form data when fetchedContainer or prefillData changes
  // useEffect(() => {
  //   const updatedData = { ...initialFormData };

  //   // Fill from fetchedContainer
  //   if (fetchedContainer) {
  //     updatedData.containerNumber = fetchedContainer.container_number || "";
  //     updatedData.shippingLineId = fetchedContainer.shipping_line_id || "";
  //     updatedData.size = fetchedContainer.size || "";
  //     updatedData.type = fetchedContainer.container_type || "";
  //     updatedData.tareWeight = fetchedContainer.tare_weight || "";
  //     updatedData.mgWeight = fetchedContainer.mg_weight || "";
  //     updatedData.mfdDate = fetchedContainer.mfd_date || "";
  //     updatedData.cscValidity = fetchedContainer.csc_validity || "";
  //     updatedData.remarks = fetchedContainer.remarks || "";
  //   }

  //   // Fill from prefillData
  //   if (prefillData) {
  //     updatedData.forwarder1Id = prefillData.forwarder1 || "";
  //     updatedData.forwarder2Id = prefillData.forwarder2 || "";
  //     updatedData.transportMode = prefillData.transport_mode || "";
  //     updatedData.yardId = prefillData.yard_name || "";
  //     updatedData.pol = prefillData.pol || "";
  //     updatedData.otherRemarks = prefillData.other_remarks || "";
  //     updatedData.loadStatus = prefillData.load_status || "";
  //     updatedData.wagonNumber = prefillData.wagon_no || "";
  //     updatedData.trainTruckNumber = prefillData.train_truck_no || "";
  //     updatedData.containerRemarks = prefillData.remarks || "";
  //     updatedData.transporter = prefillData.transporter_id || "";
  //     updatedData.shipline = prefillData.shipping_line_seal || "";
  //   }

  //   setFormData(updatedData);
  // }, [fetchedContainer, prefillData, initialFormData]);

  // Update form data when fetchedContainer or prefillData changes
  useEffect(() => {
    // Skip if no container number (new container)
    if (!containerNumber) return;

    const updatedData = { ...initialFormData };

    // Only update if fetchedContainer matches current containerNumber
    if (fetchedContainer) {
      updatedData.containerNumber = fetchedContainer.container_number || "";
      updatedData.shippingLineId = fetchedContainer.shipping_line_id || "";
      updatedData.size = fetchedContainer.size || "";
      updatedData.type = fetchedContainer.container_type || "";
      updatedData.tareWeight = fetchedContainer.tare_weight || "";
      updatedData.mgWeight = fetchedContainer.mg_weight || "";
      updatedData.mfdDate = fetchedContainer.mfd_date || "";
      updatedData.cscValidity = fetchedContainer.csc_validity || "";
      updatedData.remarks = fetchedContainer.remarks || "";
    }

    // Only update if prefillData matches current container
    if (prefillData) {
      updatedData.forwarder1Id = prefillData.forwarder1 || "";
      updatedData.forwarder2Id = prefillData.forwarder2 || "";
      updatedData.transportMode = prefillData.transport_mode || "";
      updatedData.yardId = prefillData.yard_name || "";
      updatedData.pol = prefillData.pol || "";
      updatedData.otherRemarks = prefillData.other_remarks || "";
      updatedData.loadStatus = prefillData.load_status || "";
      updatedData.wagonNumber = prefillData.wagon_no || "";
      updatedData.trainTruckNumber = prefillData.train_truck_no || "";
      updatedData.containerRemarks = prefillData.remarks || "";
      updatedData.transporter = prefillData.transporter_id || "";
      updatedData.shipline = prefillData.shipping_line_seal || "";
    }

    setFormData(updatedData);
  }, [fetchedContainer, prefillData, initialFormData, containerNumber]);

  const validateForm = (data) => {
    const errors = {};

    if (!data.transportMode) {
      errors.transportMode = "Transport Mode is required";
    }

    if (!data.loadStatus) {
      errors.loadStatus = "Load Status is required";
    }

    if (!data.arraival_date) {
      errors.arraival_date = "Arrival Date is required";
    }

    if (!data.containerStatus) {
      errors.containerStatus = "Container Status is required";
    }

    if (!data.yardId) {
      errors.yardId = "Yard Name is required";
    }

    if (
      data.forwarder1Id &&
      data.forwarder2Id &&
      data.forwarder1Id === data.forwarder2Id
    ) {
      errors.forwarder2Id = "Forwarders must be different";
    }

    return errors;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "arrival_date") {
      value = value.replace(/\D/g, "");
      if (value.length > 8) return;

      if (value.length >= 3 && value.length <= 4) {
        value = value.slice(0, 2) + "-" + value.slice(2);
      } else if (value.length > 4) {
        value =
          value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
      }

      const updatedFormData = { ...formData, [name]: value };
      setFormData(updatedFormData);
      return;
    }

    if (
      name == "containerRemarks" ||
      name == "otherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // Clear error for this field when it changes
      setFormErrors((errors) => ({ ...errors, [name]: undefined }));

      // Check for forwarder conflicts
      if (
        updatedForm.forwarder1Id &&
        updatedForm.forwarder2Id &&
        updatedForm.forwarder1Id === updatedForm.forwarder2Id
      ) {
        setErrors(true);
      } else {
        setErrors(false);
      }

      return updatedForm;
    });
  };

  // const handleSave = async () => {
  //   const validationErrors = validateForm(formData);
  //   const formattedArrivalDate = moment(
  //     formData.arraival_date,
  //     "DD-MM-YYYY"
  //   ).format("YYYY-MM-DD");

  //   if (Object.keys(validationErrors).length > 0) {
  //     setFormErrors(validationErrors);
  //     toast.error("Please correct the errors in the form");
  //     return;
  //   }

  //   const payload = {
  //     containerNumber: formData.containerNumber,
  //     forwarder1Id: formData.forwarder1Id || null,
  //     forwarder2Id: formData.forwarder2Id || null,
  //     bookingNumber: formData.bookingNumber || null,
  //     yardId: formData.yardId,
  //     transportMode: formData.transportMode,
  //     loadStatus: formData.loadStatus,
  //     transporterId: formData.transporter || null,
  //     wagonNumber: formData.wagonNumber || null,
  //     trainTruckNumber: formData.trainTruckNumber || null,
  //     seal_no: formData.shipline || null,
  //     custom: formData.custom || null,
  //     other: formData.other || null,
  //     other_description: formData.other_description || null,
  //     shipline: formData.shippingLineId || null,
  //     containerRemarks: formData.containerRemarks || null,
  //     operation: "2",
  //     pol: formData.pol || null,
  //     remarks: formData.containerRemarks || null,
  //     otherRemarks: formData.otherRemarks || null,
  //     arraival_date: formattedArrivalDate,
  //     container_status: formData.containerStatus || null,
  //   };

  //   try {
  //     const response = await dispatch(createArrivalContainer(payload)).unwrap();
  //     console.log("response.data.data.insertedId::", response.data);

  //     if (response?.success) {
  //       toast.success(
  //         `YOU HAVE SUCCESSFULLY SAVED ARRIVAL OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.arrivalContainerId}`
  //       );
  //       localStorage.setItem("operation", 2);
  //       navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
  //     } else {
  //       toast.error(response?.message || "Something went wrong!");
  //     }
  //   } catch (error) {
  //     console.error("Error creating arrival container:", error);
  //     toast.error(error.message || "Failed to create arrival container");
  //   }
  // };

  // const handleArrivalDateChange = (e) => {
  //   let { name, value } = e.target;

  //   // Remove all non-digit characters first
  //   value = value.replace(/\D/g, "");

  //   // Limit to 8 digits (DDMMYYYY)
  //   if (value.length > 8) value = value.slice(0, 8);

  //   // Auto-insert dashes as DD-MM-YYYY
  //   if (value.length >= 5) {
  //     value =
  //       value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
  //   } else if (value.length >= 3) {
  //     value = value.slice(0, 2) + "-" + value.slice(2);
  //   }

  //   // Update input value
  //   setFormData((prev) => ({ ...prev, [name]: value }));

  //   // Only validate when input is fully typed in DD-MM-YYYY format
  //   if (value.length === 10) {
  //     const inputDate = moment(value, "DD-MM-YYYY", true);
  //     const current = moment(currentDate, "DD-MM-YYYY");
  //     const minimum = moment(minAllowedDate, "DD-MM-YYYY");

  //     if (!inputDate.isValid()) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: "Invalid date format (DD-MM-YYYY)",
  //       }));
  //     } else if (inputDate.isAfter(current)) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: "Arrival Date cannot be in the future",
  //       }));
  //     } else if (inputDate.isBefore(minimum)) {
  //       setFormErrors((prev) => ({
  //         ...prev,
  //         [name]: "Arrival Date cannot be more than 3 days in the past",
  //       }));
  //     } else {
  //       setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  //     }
  //   } else {
  //     // Don't show error while typing incomplete date
  //     setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  //   }
  // };

  const handleSave = async () => {
    // Mandatory fields and their display names
    const mandatoryFields = {
      yardId: "Yard Name",
      transportMode: "Transport Mode",
      loadStatus: "Load Status",
      arraival_date: "Arrival Date",
      containerStatus: "Container Status",
    };

    // Check which mandatory fields are empty
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

    // Forwarder validation
    if (
      formData.forwarder1Id &&
      formData.forwarder2Id &&
      formData.forwarder1Id === formData.forwarder2Id
    ) {
      toast.error("Forwarder 1 and Forwarder 2 must be different");
      setFormErrors((prev) => ({
        ...prev,
        forwarder2Id: "Forwarder 1 and Forwarder 2 must be different",
      }));
      return;
    }

    // Date validation
    if (formData.arraival_date) {
      const inputDate = moment(formData.arraival_date, "DD-MM-YYYY", true);
      const current = moment(currentDate, "DD-MM-YYYY");
      const minimum = moment(minAllowedDate, "DD-MM-YYYY");

      if (!inputDate.isValid()) {
        toast.error("Invalid date format for Arrival Date");
        setFormErrors((prev) => ({
          ...prev,
          arraival_date: "Invalid date format (DD-MM-YYYY)",
        }));
        return;
      } else if (inputDate.isAfter(current)) {
        toast.error("Arrival Date cannot be in the future");
        setFormErrors((prev) => ({
          ...prev,
          arraival_date: "Date cannot be in the future",
        }));
        return;
      } else if (inputDate.isBefore(minimum)) {
        toast.error("Arrival Date cannot be more than 3 days in the past");
        setFormErrors((prev) => ({
          ...prev,
          arraival_date: "Date cannot be more than 3 days in the past",
        }));
        return;
      }
    }

    // If all validations pass
    try {
      const payload = {
        containerNumber: formData.containerNumber,
        forwarder1Id: formData.forwarder1Id || null,
        forwarder2Id: formData.forwarder2Id || null,
        bookingNumber: formData.bookingNumber || null,
        yardId: formData.yardId,
        transportMode: formData.transportMode,
        loadStatus: formData.loadStatus,
        transporterId: formData.transporter || null,
        wagonNumber: formData.wagonNumber || null,
        trainTruckNumber: formData.trainTruckNumber || null,
        seal_no: formData.shipline || null,
        custom: formData.custom || null,
        other: formData.other || null,
        other_description: formData.other_description || null,
        shipline: formData.shippingLineId || null,
        containerRemarks: formData.containerRemarks || null,
        operation: "2",
        pol: formData.pol || null,
        remarks: formData.containerRemarks || null,
        otherRemarks: formData.otherRemarks || null,
        arraival_date: moment(formData.arraival_date, "DD-MM-YYYY").format(
          "YYYY-MM-DD"
        ),
        container_status: formData.containerStatus || null,
      };

      const response = await dispatch(createArrivalContainer(payload)).unwrap();
      console.log("response.data.data.insertedId::", response.data);

      if (response?.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED ARRIVAL OPERATION FOR ${formData.containerNumber}. WHERE ENTRY ID IS ${response.data.arrivalContainerId}`
        );
        localStorage.setItem("operation", 2);
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error(response?.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error creating arrival container:", error);
      toast.error(error.message || "Failed to create arrival container");
    }
  };

  const handleArrivalDateChange = (e) => {
    let { name, value } = e.target;

    // Remove non-digit characters
    value = value.replace(/\D/g, "");

    // Limit to 8 digits (DDMMYYYY)
    if (value.length > 8) value = value.slice(0, 8);

    // Auto-insert dashes
    if (value.length >= 5) {
      value =
        value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
    } else if (value.length >= 3) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    }

    // Update input value
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Regex to match full format DD-MM-YYYY
    const fullDateRegex = /^\d{2}-\d{2}-\d{4}$/;

    // Show error if format is invalid
    if (!fullDateRegex.test(value)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Invalid date format (DD-MM-YYYY)",
      }));
      return; // Don't proceed to moment checks
    }

    // Format is valid → Now check date logic
    const inputDate = moment(value, "DD-MM-YYYY", true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    if (!inputDate.isValid()) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Invalid date",
      }));
    } else if (inputDate.isAfter(current)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Arrival Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Arrival Date cannot be more than 3 days in the past",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  console.log("Previous Data::", prefillData);
  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Arrival of Container"
        parent="Apps"
        title="Arrival of Container"
      />

      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              {/* Container Details Section */}
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange}
                forwarders={forwarders}
                forwardersLoading={forwardersState.loading}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />

              {/* Client Details Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Client Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Shipping Line</Label>
                    <select
                      name="shippingLineId"
                      className="form-select form-control"
                      onChange={handleChange}
                      value={formData.shippingLineId}
                    >
                      <option value="">Select Shipping line</option>
                      {forwarders
                        .filter((res) => res.category === "shipping")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Forwarder1 Code Name</Label>
                    <select
                      name="forwarder1Id"
                      className="form-select form-control"
                      onChange={handleChange}
                      value={formData.forwarder1Id}
                    >
                      <option value="">Select Forwarder</option>
                      {forwarders
                        .filter((res) => res.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                    {errors && (
                      <span className="text-danger">
                        Forwarder1 and Forwarder2 must be different
                      </span>
                    )}
                  </Col>

                  <Col md="6">
                    <Label className="large mb-1">Forwarder2 Code Name</Label>
                    <select
                      name="forwarder2Id"
                      className="form-select form-control"
                      onChange={handleChange}
                      value={formData.forwarder2Id}
                    >
                      <option value="">Select Forwarder</option>
                      {forwarders
                        .filter((res) => res.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                </Row>
              </div>

              {/* Booking/Yard Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Booking Number/ Yard</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Booking Number</label>
                    <input
                      name="bookingNumber"
                      className="form-control"
                      placeholder="Booking Number"
                      onChange={handleChange}
                      value={formData.bookingNumber}
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
                      className={`form-select ${
                        formErrors.yardId ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select Yard</option>
                      {yards.map((yard) => (
                        <option key={yard.id} value={yard.id}>
                          {yard.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.yardId && (
                      <div className="invalid-feedback">
                        {formErrors.yardId}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Transport Details Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Transport Detail</h5>

                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      Transport Mode{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="transportMode"
                      className={`form-select ${
                        formErrors.transportMode ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.transportMode}
                    >
                      <option value="">Transport Mode</option>
                      <option value="rail">Rail</option>
                      <option value="road">Road</option>
                    </select>
                    {formErrors.transportMode && (
                      <div className="invalid-feedback">
                        {formErrors.transportMode}
                      </div>
                    )}
                  </Col>

                  <Col md="6">
                    <label>
                      Load Status{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="loadStatus"
                      className={`form-select ${
                        formErrors.loadStatus ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.loadStatus}
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                    {formErrors.loadStatus && (
                      <div className="invalid-feedback">
                        {formErrors.loadStatus}
                      </div>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>Transporter</label>
                    {formData.transportMode === "rail" ? (
                      <input
                        className="form-control"
                        placeholder="Transporter"
                        value="N/A"
                        disabled
                      />
                    ) : (
                      <select
                        name="transporter"
                        className={`form-select ${
                          formErrors.transporter ? "is-invalid" : ""
                        }`}
                        onChange={handleChange}
                        value={formData.transporter}
                        disabled={formData.transportMode !== "road"}
                      >
                        <option value="">Select Transporter</option>
                        {transporters.map((transporter) => (
                          <option key={transporter.id} value={transporter.id}>
                            {`${transporter.name} -- ${transporter.code}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.transporter && (
                      <div className="invalid-feedback">
                        {formErrors.transporter}
                      </div>
                    )}
                  </Col>

                  <Col md="6">
                    <label>Wagon Number</label>
                    {formData.transportMode === "road" ? (
                      <input
                        className="form-control"
                        placeholder="Wagon Number"
                        value="N/A"
                        disabled
                      />
                    ) : (
                      <>
                        <input
                          name="wagonNumber"
                          className={`form-control ${
                            formErrors.wagonNumber ? "is-invalid" : ""
                          }`}
                          placeholder="Wagon Number"
                          onChange={handleChange}
                          value={formData.wagonNumber}
                        />
                        {formErrors.wagonNumber && (
                          <div className="invalid-feedback">
                            {formErrors.wagonNumber}
                          </div>
                        )}
                      </>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      {formData.transportMode === "rail"
                        ? "Train Number"
                        : "Truck Number"}
                    </label>
                    <input
                      name="trainTruckNumber"
                      className="form-control"
                      placeholder={
                        formData.transportMode === "rail"
                          ? "Train Number"
                          : "Truck Number"
                      }
                      onChange={handleChange}
                      value={formData.trainTruckNumber}
                    />
                  </Col>

                  <Col md={formData.transportMode === "rail" ? 6 : 6}>
                    <label>POL</label>
                    <input
                      name="pol"
                      className="form-control"
                      placeholder="POL"
                      onChange={handleChange}
                      value={formData.pol}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      Arrival Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="arraival_date"
                      type="text"
                      className={`form-control ${
                        formErrors.arraival_date ? "is-invalid" : ""
                      }`}
                      onChange={handleArrivalDateChange}
                      value={formData.arraival_date}
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="Arrival date"
                    />
                    {formErrors.arraival_date && (
                      <div className="invalid-feedback">
                        {formErrors.arraival_date}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Seal Details Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Seal Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Ship Line Seal No</label>
                    <input
                      name="shipline"
                      className="form-control"
                      placeholder="Ship Line"
                      onChange={handleChange}
                      value={formData.shipline}
                    />
                  </Col>

                  <Col md="6">
                    <label>Custom</label>
                    <input
                      name="custom"
                      className="form-control"
                      placeholder="Custom"
                      onChange={handleChange}
                      value={formData.custom}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <label>Other</label>
                    <input
                      name="other"
                      className="form-control"
                      placeholder="Other"
                      onChange={handleChange}
                      value={formData.other}
                    />
                  </Col>

                  <Col md="6">
                    <label>Other Seal Description</label>
                    <input
                      name="other_description"
                      className="form-control"
                      placeholder="Other seal Description"
                      onChange={handleChange}
                      value={formData.other_description}
                    />
                  </Col>
                </Row>
              </div>

              {/* Container Condition Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Container Condition</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>
                      Container Status{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
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
                    <label>Container Remarks</label>
                    <textarea
                      name="containerRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.containerRemarks}
                      placeholder="Container Remarks"
                    />
                  </Col>

                  <Col md="6">
                    <label>Any Other Remarks</label>
                    <textarea
                      name="otherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.otherRemarks}
                      placeholder="Any Other Remarks"
                    />
                  </Col>
                </Row>
              </div>

              {/* Save Button */}
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

export default ArrivalContainer;
