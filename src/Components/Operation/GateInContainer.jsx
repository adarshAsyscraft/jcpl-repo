import React, {
  Fragment,
  useCallback,
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
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import ContainerDetailsSection from "./containerDetails";
import { Select } from "antd";
import moment from "moment";

import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import { z } from "zod";

const { Option } = Select;

// Define validation schema
const gateInSchema = z
  .object({
    inDate: z.string().nonempty("Gate In Date is required"),
    inTime: z.string().nonempty("Gate In Time is required"),
    gateInFrom: z.string().nonempty("Gate In From is required"),
    loadStatus: z.string().nonempty("Load Status is required"),
    gateOutDate: z.string().nonempty("Gate Out Date is required"), // for validation only
  })
  .refine((data) => data.forwarder1 !== data.forwarder2, {
    message: "Forwarder 1 and Forwarder 2 cannot be the same",
    path: ["forwarder2"],
  })
  .refine(
    (data) => {
      const gateIn = moment(
        data.inDate,
        ["DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"],
        true
      ).startOf("day");
      const gateOut = moment(
        data.gateOutDate,
        ["DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"],
        true
      ).startOf("day");

      if (!gateIn.isValid() || !gateOut.isValid()) return false;

      return gateIn.isAfter(gateOut);
    },
    {
      message: "Gate In Date must be after Gate Out Date",
      path: ["inDate"],
    }
  );

const GateIn = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const containerData = location.state || "";
  const { fetchedContainer } = useSelector((state) => state.container);
  const transporters = useSelector((state) => state.transporters);
  const selectedOperation = location.state?.operation || "1";
  const [previousPageData, setPreviousPageData] = useState({});
  const [loading, setLoading] = useState(true);
  const [gateOutDate, setGateOutDate] = useState(null);
  const currentDate = useMemo(() => moment().format("DD-MM-YYYY"), []);
  const { data: yards } = useSelector((state) => state.yards || {});
  const [isLoading, setIsLoading] = useState(false);
  const minAllowedDate = useMemo(
    () => moment().subtract(3, "days").format("DD-MM-YYYY"),
    []
  );
  const [allotmentVesselViaNumber, setAllotmentVesselViaNumber] =
    useState(null);

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
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
    pol: "",
    shippingLineSeal: "",
    otherRemarks: "",
    loadStatus: "",
    arrivalGateIn: "",
    gateInFrom: "",
    transporter: "",
    train_truck_no: "",
    ref: "",
    consigneeName: "",
    shipLine: "",
    shipLineStatue: "",
    custom: "",
    customStatus: "",
    vesselViaNo: "",
    other: "",
    otherStatus: "",
    otherSealDiscription: "",
    refNo: "",
    inDate: "",
    inTime: "",
    containerStatus: "",
    containerRemarks: "",
    destinationPlace: "",
    place: "",
    outTime: "",
    refrenceNumber: "",
  });

  const [formData2, setFormData2] = useState({ ...formData });

  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const {
    data = [],
    loading: yardsLoading,
    error: yardsError,
  } = useSelector((state) => state.yards || {});

  const getPreviousPageData = useCallback(async () => {
    try {
      const res = await operationService.getOutContainerExists(containerNumber);
      if (res.success) {
        setPreviousPageData(res.data);
      }
    } catch (error) {
      console.error("Error fetching previous page data:", error);
    }
  }, [containerNumber]);

  const getVesselViaNumber = async () => {
    const result = await operationService.allotmentStuffingDetailsByContainerNo(
      containerNumber
    );
    setAllotmentVesselViaNumber(result.data.vessel_via_no);
  };

  // useEffect(() => {
  //   getVesselViaNumber();
  // }, [containerNumber]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchContainerByNumber(containerNumber));
        await dispatch(fetchForwarders());
        await dispatch(fetchContainerTypes());
        await dispatch(fetchYards());
        await dispatch(fetchTransporters());
        await getPreviousPageData();
        await getVesselViaNumber();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [containerNumber, dispatch, getPreviousPageData]);

  useEffect(() => {
    if (fetchedContainer && !loading) {
      const newFormData = {
        containerNumber: fetchedContainer?.container_number || "",
        shippingLineId: fetchedContainer?.shipping_line_id || "",
        size: fetchedContainer?.size || "",
        type: fetchedContainer?.container_type || "",
        tareWeight: fetchedContainer?.tare_weight || "",
        mgWeight: fetchedContainer?.mg_weight || "",
        mfdDate: fetchedContainer?.mfd_date || "",
        cscValidity: fetchedContainer?.csc_validity || "",
        remarks: fetchedContainer?.remarks || "",
        operation: selectedOperation || "",
        forwarder1: String(previousPageData?.forwarder1Id || ""),
        forwarder2: String(previousPageData?.forwarder2Id || ""),
        bookingNumber: previousPageData?.bookingNumber || "",
        yardName: previousPageData?.yardId,
        loadStatus: previousPageData?.loadStatus,
        custom: previousPageData?.custom,
        other: previousPageData?.other,
        shipLine: previousPageData?.shipline,
        otherSealDiscription: previousPageData?.otherSealDescription,
        // loadStatus:
        //   previousPageData?.loadStatus == "loaded" ? "empty" : "loaded",
        vesselViaNo: allotmentVesselViaNumber,
        transporter: previousPageData?.transporter || "",
        train_truck_no: previousPageData?.truckNumber || "",
        refNo: previousPageData?.refrenceNumber || "",
        containerStatus: previousPageData?.containerStatus || "",
        containerRemarks: previousPageData?.remarks || "",
        gateInFrom: previousPageData?.outFor || "",
        destinationPlace: previousPageData?.destinationPlace || "",
        place: previousPageData?.place || "",
        outTime: previousPageData?.outTime || "",
        outDate: previousPageData?.outDate || "",
        refrenceNumber: previousPageData?.refrenceNumber || "",
        otherRemarks: "",
      };

      setFormData((prev) => ({ ...prev, ...newFormData }));
      setFormData2((prev) => ({ ...prev, ...newFormData }));
    }
  }, [fetchedContainer, previousPageData, selectedOperation, loading]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name === "containerRemarks" ||
      name === "otherRemarks" ||
      e.target.type === "text"
    ) {
      value = value.toUpperCase();
    }

    let formattedValue = value;

    if (name === "inTime") {
      const cleaned = value.replace(/\D/g, ""); // remove non-digits
      const limited = cleaned.slice(0, 4); // max 4 digits

      if (limited.length <= 2) {
        formattedValue = limited;
      } else {
        formattedValue = `${limited.slice(0, 2)}:${limited.slice(2)}`;
      }

      if (limited.length === 4) {
        const inputTime = moment(formattedValue, "HH:mm");
        const outTime = moment(formData.outTime, "HH:mm");

        const gateInDateRaw = formData.inDate;
        const gateOutDateRaw = previousPageData?.outDate;

        const gateInDate = gateInDateRaw
          ? moment(
              gateInDateRaw,
              ["DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"],
              true
            ).startOf("day")
          : null;
        const gateOutDate = gateOutDateRaw
          ? moment(gateOutDateRaw).startOf("day")
          : null;

        if (
          inputTime.isValid() &&
          outTime.isValid() &&
          gateInDate &&
          gateOutDate
        ) {
          // Only validate time difference if dates are the same
          if (gateInDate.isSame(gateOutDate, "day")) {
            const diffInMinutes = inputTime.diff(outTime, "minutes");
            if (diffInMinutes < 15) {
              setErrors((prev) => ({
                ...prev,
                [name]:
                  "Gate In Time must be at least 15 minutes after Gate Out Time when dates are the same",
              }));
            } else {
              setErrors((prev) => ({ ...prev, [name]: "" }));
            }
          }
          // No time validation needed if gateInDate is after gateOutDate
          else if (gateInDate.isAfter(gateOutDate)) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
          }
          // Optional: Add validation if gateInDate is before gateOutDate
          else if (gateInDate.isBefore(gateOutDate)) {
            setErrors((prev) => ({
              ...prev,
              [name]: "Gate In Date cannot be before Gate Out Date",
            }));
          }
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear unrelated error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Forwarder validation
    if (name === "forwarder2" && formattedValue === formData.forwarder1) {
      setErrors((prev) => ({
        ...prev,
        forwarder2: "Forwarder 2 must be different from Forwarder 1",
      }));
    } else if (
      name === "forwarder1" &&
      formattedValue === formData.forwarder2
    ) {
      setErrors((prev) => ({
        ...prev,
        forwarder2: "Forwarder 2 must be different from Forwarder 1",
      }));
    }
  };

  const handleChange2 = (field, value) => {
    setFormData2((prev) => ({ ...prev, [field]: value }));
  };

  console.log("previousPageData::", previousPageData);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.yardName) newErrors.yardName = "Yard Name is required";
    if (!formData.inDate) newErrors.inDate = "In Date is required";
    if (!formData.inTime) newErrors.inTime = "In Time is required";
    if (!formData.loadStatus) newErrors.loadStatus = "Load Status is required";

    // Forwarder validation
    if (
      formData.forwarder1 &&
      formData.forwarder2 &&
      formData.forwarder1 === formData.forwarder2
    ) {
      newErrors.forwarder2 = "Forwarder 2 must be different from Forwarder 1";
    }

    setErrors(newErrors);
    // toast.error("Please fill the mandatory Fields");
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const mandatoryFields = {
      yardName: "Yard Name",
      inDate: "In Date",
      inTime: "In Time",
      loadStatus: "Load Status",
      containerStatus: "Container Status",
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
      setErrors(newErrors);
      return;
    }

    // Time format validation
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(formData.inTime)) {
      toast.error("In Time must be in HH:MM format");
      setErrors((prev) => ({
        ...prev,
        inTime: "Enter In Time in HH:MM format",
      }));
      return;
    }

    const gateInTime = moment(formData.inTime, "HH:mm");
    const gateOutTime = moment(formData.outTime, "HH:mm");
    const gateInDate = moment(formData.inDate, "DD-MM-YYYY", true).startOf(
      "day"
    );
    const gateOutDate = previousPageData?.outDate
      ? moment(previousPageData.outDate).startOf("day")
      : null;

    if (
      gateInTime.isValid() &&
      gateOutTime.isValid() &&
      gateInDate.isValid() &&
      gateOutDate?.isValid()
    ) {
      if (gateInDate.isSame(gateOutDate, "day")) {
        const diffMinutes = gateInTime.diff(gateOutTime, "minutes");
        if (diffMinutes < 15) {
          toast.error(
            "Gate In Time must be at least 15 minutes after Gate Out Time"
          );
          setErrors((prev) => ({
            ...prev,
            inTime:
              "Gate In Time must be at least 15 minutes after Gate Out Time when dates are the same",
          }));
          return;
        }
      } else if (gateInDate.isBefore(gateOutDate)) {
        toast.error("Gate In Date cannot be before Gate Out Date");
        setErrors((prev) => ({
          ...prev,
          inDate: "Gate In Date cannot be before Gate Out Date",
        }));
        return;
      }
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
      }));
      return;
    }

    // Date validation
    const gateInDateRaw = formData.inDate;
    const gateOutDateRaw = previousPageData?.outDate;

    const gateIn = moment(gateInDateRaw, "DD-MM-YYYY", true);
    const gateOut = gateOutDateRaw
      ? moment(gateOutDateRaw).startOf("day")
      : null;
    const current = moment(currentDate, "DD-MM-YYYY");

    if (!gateIn.isValid()) {
      toast.error("Invalid date format for In Date (DD-MM-YYYY)");
      setErrors((prev) => ({
        ...prev,
        inDate: "Invalid date format (DD-MM-YYYY)",
      }));
      return;
    } else if (gateIn.isAfter(current)) {
      toast.error("In Date cannot be in the future");
      setErrors((prev) => ({
        ...prev,
        inDate: "In Date cannot be in the future",
      }));
      return;
    } else if (gateOut && gateIn.isBefore(gateOut)) {
      toast.error("In Date cannot be before previous Gate Out Date");
      setErrors((prev) => ({
        ...prev,
        inDate: "In Date cannot be before Gate Out Date",
      }));
      return;
    }

    // All validations passed
    const formattedInDate = gateIn.format("YYYY-MM-DD");
    setIsLoading(true);

    const payload = {
      containerNumber: formData.containerNumber || "",
      shipLine: formData.shipLine || "",
      serviceCode: formData.serviceCode || "empty",
      size: Number(formData.size),
      containerStatus: formData.containerStatus || "",
      forwarder1Id: Number(formData.forwarder1),
      forwarder2Id: Number(formData.forwarder2),
      transporter: Number(formData.transporter),
      inDate: formattedInDate,
      inTime: formData.inTime || "",
      loadStatus: formData.loadStatus || "",
      arrivalExportGetIn: formData.arrivalGateIn || "",
      getInFrom: formData.gateInFrom || "",
      referenceNumber: formData.refrenceNumber || "",
      bookingNo: formData.bookingNumber || "",
      truckNumber: formData.truckNumber || "",
      operation: "Get In",
      custom: formData.custom || "",
      other: formData.other || "",
      otherSealDescription: formData.otherSealDiscription || "",
      otherRemarks: formData.otherRemarks || "",
      remarks: formData.containerRemarks || "",
      yard: formData.yardName || "",
    };

    try {
      const response = await operationService.gateIn(payload);

      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED GATE-IN OPERATION FOR ${formData.containerNumber}. WHERE ENTRY ID IS ${response.data.getInContainerId}`
        );
        localStorage.setItem("operation", 10);

        if (
          formData.loadStatus === "loaded" &&
          formData.gateInFrom === "Factory Stuffing"
        ) {
          const confirmStuffing = window.confirm(
            `Do you want to do the entry of Stuffing`
          );
          if (confirmStuffing) {
            navigate(
              `${process.env.PUBLIC_URL}/app/factory-stuffing/${formData.containerNumber}/${layoutURL}`
            );
          }
        } else {
          navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
        }
      } else {
        toast.error("Failed to save gate in operation");
      }
    } catch (error) {
      console.error("Error saving gate in:", error);
      toast.error("An error occurred while saving gate in operation");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading container data...</div>;
  }

  const handleGateInDateChange = (e) => {
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

    // Validate format
    const isValidFormat =
      /^(0[1-9]|[12][0-9]|3[01])([-/.])(?:0[1-9]|1[0-2])\2\d{4}$/.test(value);

    const matched = value.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
    const separator = matched?.[2];

    const formatMap = {
      "-": "DD-MM-YYYY",
      "/": "DD/MM/YYYY",
      ".": "DD.MM.YYYY",
    };

    const gateInDate = moment(value, formatMap[separator], true);
    const current = moment(currentDate, "DD-MM-YYYY");
    const minimum = moment(minAllowedDate, "DD-MM-YYYY");

    const gateOutDateRaw = previousPageData?.outDate;

    const gateOutDate = gateOutDateRaw
      ? moment(gateOutDateRaw).startOf("day") // ISO string to moment
      : null;

    const gateInDateStart = gateInDate.clone().startOf("day"); // normalize to day

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Gate In Date is required",
      }));
    } else if (!isValidFormat || !gateInDate.isValid()) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (gateInDate.isAfter(current)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date cannot be in the future",
      }));
    } else if (
      gateOutDate &&
      gateOutDate.isValid() &&
      gateInDateStart.isBefore(gateOutDate)
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Gate In Date cannot be before Gate Out Date",
      }));
    } else if (gateInDate.isBefore(minimum)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date cannot be more than 3 days in the past",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  console.log("Yard::", fetchedContainer);

  const date = new Date(previousPageData?.updatedAt);

  const formatted = date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Gate In Container"
        parent="Apps"
        title="Gate In Container"
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
              <div className="shadow-sm p-4 mt-4">
                <h5 className="mb-3 mt-4">Last Operation Gate Out Details</h5>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Entry Id</Label>
                    <input
                      disabled
                      name="entryId"
                      className="form-control"
                      value={previousPageData?.id || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Container Number</Label>
                    <input
                      disabled
                      name="containerNumber"
                      className="form-control"
                      value={fetchedContainer?.container_number || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Forwarder1 Code</Label>
                    <select
                      disabled
                      name="forwarder1"
                      className="form-select form-select-sm"
                      value={previousPageData?.forwarder1Id || ""}
                    >
                      <option value="">Select Forwarder1</option>
                      {forwarders
                        ?.filter((f) => f.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={String(fwd.id)}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Forwarder2 Code</Label>
                    <select
                      disabled
                      name="forwarder2"
                      className="form-select form-select-sm"
                      value={previousPageData?.forwarder2Id || ""}
                    >
                      <option value="">Select Forwarder2</option>
                      {forwarders
                        ?.filter((f) => f.category === "forwarder")
                        .map((fwd) => (
                          <option key={fwd.id} value={String(fwd.id)}>
                            {fwd.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Out For</Label>
                    <input
                      disabled
                      name="outFor"
                      className="form-control"
                      value={previousPageData?.outFor || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Out Date</Label>
                    <input
                      disabled
                      name="outDate"
                      className="form-control"
                      value={moment(previousPageData?.outDate).format(
                        "DD-MM-YYYY"
                      )}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Out Time</Label>
                    <input
                      disabled
                      name="outTime"
                      className="form-control"
                      value={previousPageData?.outTime || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Load Status</Label>
                    <select
                      disabled
                      name="loadStatus"
                      className="form-select"
                      value={previousPageData?.loadStatus || ""}
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Booking Number</Label>
                    <input
                      disabled
                      name="bookingNumber"
                      className="form-control"
                      value={previousPageData?.bookingNumber || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">ICD of the Operation</Label>
                    <input
                      disabled
                      name="icdOperation"
                      className="form-control"
                      value={previousPageData?.icdOperation || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Yard</Label>
                    <select
                      disabled
                      name="yardId"
                      className="form-select"
                      value={previousPageData?.yardId || ""}
                    >
                      <option value="">Select Yard</option>
                      {yards?.map((yard) => (
                        <option key={yard.id} value={yard.id}>
                          {yard.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Reference Number</Label>
                    <input
                      disabled
                      name="refrenceNumber"
                      className="form-control"
                      value={previousPageData?.refrenceNumber || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Train/Truck Number</Label>
                    <input
                      disabled
                      name="truckNumber"
                      className="form-control"
                      value={previousPageData?.truckNumber || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Transporter</Label>
                    <select
                      disabled
                      name="transporter"
                      className="form-select"
                      value={previousPageData?.transporter || ""}
                    >
                      <option value="">Select Transporter</option>
                      {transporters?.data?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Destination Place</Label>
                    <input
                      disabled
                      name="destinationPlace"
                      className="form-control"
                      value={previousPageData?.destinationPlace || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Place</Label>
                    <input
                      disabled
                      name="place"
                      className="form-control"
                      value={previousPageData?.place || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Shipping Line Seal Number</Label>
                    <input
                      disabled
                      name="shipline"
                      className="form-control"
                      value={previousPageData?.shipline || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Custom</Label>
                    <input
                      disabled
                      name="custom"
                      className="form-control"
                      value={previousPageData?.custom || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Other Seal Description</Label>
                    <input
                      disabled
                      name="otherSealDescription"
                      className="form-control"
                      value={previousPageData?.otherSealDescription || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Other</Label>
                    <input
                      disabled
                      name="other"
                      className="form-control"
                      value={previousPageData?.other || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">
                      Container Status{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </Label>
                    <select
                      disabled
                      name="containerStatus"
                      className="form-select"
                      value={previousPageData?.containerStatus || ""}
                    >
                      <option value="">Container Status</option>
                      <option value="Sound">Sound</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Remarks</Label>
                    <input
                      disabled
                      name="remarks"
                      className="form-control"
                      value={previousPageData?.remarks || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Other Remarks</Label>
                    <input
                      disabled
                      name="otherRemarks"
                      className="form-control"
                      value={previousPageData?.otherRemarks || ""}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Entry Person Id</Label>
                    <input
                      disabled
                      name="entryPersonId"
                      className="form-control"
                      value={previousPageData?.entryPersonId || ""}
                    />
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Last Update Date</Label>
                    <input
                      disabled
                      name="lastUpdateDate"
                      className="form-control"
                      value={moment(previousPageData?.updatedAt).format(
                        "DD-MM-YYYY"
                      )}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Last Update Time</Label>
                    <input
                      disabled
                      name="lastUpdateTime"
                      className="form-control"
                      value={formatted}
                    />
                  </Col>
                </Row>
              </div>

              <ContainerDetailsSection
                formData={formData2}
                handleChange={handleChange2}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={fetchedContainer}
                disabled={false}
              />

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Client Detail</h5>

                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Forwarder1 Code Name</Label>
                    <select
                      name="forwarder1"
                      className={`form-select form-select-sm ${
                        errors.forwarder1 ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.forwarder1}
                    >
                      <option value="">Select Forwarder</option>
                      {forwardersLoading ? (
                        <option>Loading...</option>
                      ) : (
                        forwarders
                          .filter((res) => res.category === "forwarder")
                          .map((fwd) => (
                            <option key={fwd.id} value={fwd.id}>
                              {fwd.name}
                            </option>
                          ))
                      )}
                    </select>
                    {errors.forwarder1 && (
                      <div className="invalid-feedback">
                        {errors.forwarder1}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Forwarder2 Code Name</Label>
                    <select
                      name="forwarder2"
                      className={`form-select form-select-sm ${
                        errors.forwarder2 ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.forwarder2}
                    >
                      <option value="">Select Forwarder</option>
                      {forwardersLoading ? (
                        <option>Loading...</option>
                      ) : (
                        forwarders
                          .filter((res) => res.category === "forwarder")
                          .map((fwd) => (
                            <option key={fwd.id} value={fwd.id}>
                              {fwd.name}
                            </option>
                          ))
                      )}
                    </select>
                    {errors.forwarder2 && (
                      <div className="invalid-feedback">
                        {errors.forwarder2}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Booking No/ Yard</h5>
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
                      Yard <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="yardName"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.yardName}
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
                </Row>
              </div>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Transport Detail</h5>
                <Row className="mb-3">
                  <Col md="4">
                    <label>
                      Gate In Date{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="inDate"
                      type="text"
                      className={`form-control ${
                        errors.inDate ? "is-invalid" : ""
                      }`}
                      onChange={handleGateInDateChange}
                      value={formData.inDate}
                      placeholder="DD-MM-YYYY"
                    />
                    {errors.inDate && (
                      <div className="invalid-feedback">{errors.inDate}</div>
                    )}
                  </Col>
                  <Col md="4">
                    <label>
                      Gate In Time{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <input
                      name="inTime"
                      type="text"
                      className={`form-control ${
                        errors.inTime ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.inTime}
                      placeholder="Enter In Time (e.g., 11:30)"
                    />
                    {errors.inTime && (
                      <div className="invalid-feedback">{errors.inTime}</div>
                    )}
                  </Col>
                  <Col md="4">
                    <label>
                      Load Status{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      name="loadStatus"
                      className={`form-select ${
                        errors.loadStatus ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.loadStatus}
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                    {errors.loadStatus && (
                      <div className="invalid-feedback">
                        {errors.loadStatus}
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label>Arrival/Export Gate In</label>
                    <select
                      disabled={previousPageData ? true : false}
                      name="arrivalGateIn"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.arrivalGateIn}
                    >
                      <option value="">Select</option>
                      <option value="export-gate-in">Export Gate In</option>
                      <option value="arrival">Arrival</option>
                    </select>
                  </Col>
                  <Col md="4">
                    <label>
                      Gate In From{" "}
                      <span className="large mb-1 text-danger">*</span>
                    </label>
                    <select
                      disabled={formData.arrivalGateIn ? false : true}
                      name="gateInFrom"
                      className={`form-select ${
                        errors.gateInFrom ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.gateInFrom}
                    >
                      <option value="">Select</option>
                      <option value={"Factory Stuffing"}>
                        Factory Stuffing
                      </option>
                      <option value={"Factory Destuffing"}>
                        Factory Destuffing
                      </option>
                      <option value="MOVE TO OTHER ICD SITES">
                        Move to Other ICD
                      </option>
                      <option value="MOVE TO OTHER YARD">
                        Move to Other Yard
                      </option>
                      <option value="Dispatch to PORT">Dispatch to PORT</option>
                      <option value="bby">BBY</option>
                      <option value="mdpt">MDPT</option>
                      <option value="ppsp">PPSP</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gateInFrom && (
                      <div className="invalid-feedback">
                        {errors.gateInFrom}
                      </div>
                    )}
                  </Col>
                  <Col md="4">
                    <label>Transporter</label>
                    <select
                      name="transporter"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.transporter}
                    >
                      <option value="">Select Transporter</option>
                      {transporters?.data?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Truck Number</label>
                    <input
                      name="train_truck_no"
                      className="form-control"
                      placeholder="Train/Truck No"
                      onChange={handleChange}
                      value={formData.train_truck_no}
                    />
                  </Col>
                  <Col md="6">
                    <label>Ref No.</label>
                    <input
                      name="refNo"
                      className="form-control"
                      placeholder="Ref No."
                      onChange={handleChange}
                      value={formData.refNo}
                    />
                  </Col>
                </Row>
              </div>

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Vessel & Consignee Name</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Vessel & Via No.</label>
                    <input
                      disabled
                      name="vesselViaNo"
                      className="form-control"
                      placeholder=""
                      onChange={handleChange}
                      value={formData.vesselViaNo}
                    />
                  </Col>
                </Row>
              </div>

              {formData.loadStatus === "loaded" && (
                <div className="shadow-sm p-4 rounded mt-4">
                  <h5 className="mb-3 mt-4">Seal Details</h5>

                  <Row className="mb-3">
                    <Col md="6">
                      <Label className="mb-1">Shipping Line Seal Number</Label>
                      <input
                        name="shipLine"
                        type="text"
                        onChange={handleChange}
                        className="form-control"
                        value={formData.shipLine}
                      />
                    </Col>
                    <Col md="6">
                      <Label className="mb-1">Custom</Label>
                      <input
                        name="custom"
                        type="text"
                        onChange={handleChange}
                        className="form-control"
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
                        placeholder="other"
                        onChange={handleChange}
                        value={formData.other}
                      />
                    </Col>
                    <Col md="6">
                      <label>Other Seal Discription</label>
                      <input
                        name="otherSealDiscription"
                        className="form-control"
                        placeholder="Other"
                        onChange={handleChange}
                        value={formData.otherSealDiscription}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Container Condition</h5>
                <Row className="mb-3">
                  <Col md="4">
                    <label>
                      Container Status{" "}
                      <span className="large mb-1 text-danger">*</span>{" "}
                    </label>
                    <select
                      name="containerStatus"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.containerStatus}
                    >
                      <option value="">Select</option>
                      <option value="Sound">Sound</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </Col>
                  <Col md="4">
                    <label> Remarks</label>
                    <textarea
                      name="containerRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.containerRemarks.toUpperCase()}
                      placeholder="Remarks"
                    ></textarea>
                  </Col>
                  <Col md="4">
                    <label>Other Remarks</label>
                    <textarea
                      name="otherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.otherRemarks.toUpperCase()}
                      placeholder="Any Other Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>

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

export default GateIn;
