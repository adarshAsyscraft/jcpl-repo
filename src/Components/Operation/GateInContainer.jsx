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
    forwarder1: z.string().nonempty("Forwarder 1 is required"),
    forwarder2: z.string().nonempty("Forwarder 2 is required"),
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

  useEffect(() => {
    getVesselViaNumber();
  }, [containerNumber]);

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
      name == "containerRemarks" ||
      name == "otherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    let formattedValue = value;

    // Format outTime to hh:mm if plain digits are typed
    if (name === "inTime") {
      const cleaned = value.replace(/\D/g, ""); // remove non-digits
      const limited = cleaned.slice(0, 4); // max 4 digits

      if (limited.length <= 2) {
        formattedValue = limited;
      } else {
        formattedValue = `${limited.slice(0, 2)}:${limited.slice(2)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Special handling for forwarder2 to check if it's same as forwarder1
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
    try {
      const gateOutDateISO = moment(previousPageData?.outDate).startOf("day");
      const gateInDate = moment(
        formData.inDate,
        ["DD-MM-YYYY", "DD/MM/YYYY", "DD.MM.YYYY"],
        true
      ).startOf("day");

      const validationData = {
        ...formData,
        gateOutDate: gateOutDateISO.isValid()
          ? gateOutDateISO.format("DD-MM-YYYY")
          : "",
        inDate: gateInDate.isValid()
          ? gateInDate.format("DD-MM-YYYY")
          : formData.inDate,
      };

      console.log("▶️ VALIDATING FORM");
      console.log("➡️ inDate (Gate In):", validationData.inDate);
      console.log("➡️ gateOutDate:", validationData.gateOutDate);

      gateInSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // const handleSave = async () => {
  //   const formattedGateInDate = moment(formData.inDate, "DD-MM-YYYY").format(
  //     "YYYY-MM-DD"
  //   );

  //   if (!validateForm()) {
  //     toast.error("Please fix the validation errors before submitting");
  //     return;
  //   }

  //   const payload = {
  //     containerNumber: formData.containerNumber || "",
  //     shipLine: formData.shippingLineId || "",
  //     serviceCode: formData.serviceCode || "empty",
  //     size: Number(formData.size),
  //     containerStatus: formData.containerStatus || "",
  //     forwarder1Id: Number(formData.forwarder1),
  //     forwarder2Id: Number(formData.forwarder2),
  //     transporter: Number(formData.transporter),
  //     inDate: formattedGateInDate,
  //     inTime: formData.inTime || "",
  //     loadStatus: formData.loadStatus || "",
  //     arrivalExportGetIn: formData.arrivalGateIn || "",
  //     getInFrom: formData.gateInFrom || "",
  //     referenceNumber: formData.refrenceNumber || "",
  //     truckNumber: formData.truckNumber || "",
  //     operation: "Get In",
  //     custom: formData.custom || "",
  //     other: formData.other || "",
  //     otherSealDescription: formData.otherSealDiscription || "",
  //     otherRemarks: formData.otherRemarks || "",
  //     remarks: formData.containerRemarks || "",
  //     yard: formData.yardName || "",
  //   };

  //   try {
  //     const confirm = window.confirm(`Do you want to do the entry of Stuffing`);
  //     const response = await operationService.gateIn(payload);
  //     if (response.success) {
  //       toast.success(
  //         `YOU HAVE SUCCESSFULLY SAVED GATE-IN OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.getInContainerId}`
  //       );
  //       localStorage.setItem("operation", 10);
  //       if (formData.loadStatus == "loaded") {
  //         // by defaul factory stuffing ka data create krwa dena hai
  //       }
  //       navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
  //     }
  //     if (confirm) {
  //       navigate(`${process.env.PUBLIC_URL}/app/factory-stuffing/${layoutURL}`);
  //     } else {
  //       navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
  //     }
  //   } catch (error) {
  //     toast.error("Failed to create GateIn");
  //   }
  // };

  const handleSave = async () => {
    // 1. Parse Gate In Date from formData (user input)
    const gateInDate = moment(formData.inDate, "DD-MM-YYYY").startOf("day");

    // 2. Parse Gate Out Date from previous page data (ISO format)
    const gateOutDate = moment(previousPageData?.outDate).startOf("day");

    // 4. Final ISO-formatted date to send to backend (start of day)
    const formattedGateInDate = gateInDate.toISOString(); // "2025-07-14T00:00:00.000Z"

    // 6. Build payload
    const payload = {
      containerNumber: formData.containerNumber || "",
      shipLine: formData.shipLine || "",
      serviceCode: formData.serviceCode || "empty",
      size: Number(formData.size),
      containerStatus: formData.containerStatus || "",
      forwarder1Id: Number(formData.forwarder1),
      forwarder2Id: Number(formData.forwarder2),
      transporter: Number(formData.transporter),
      inDate: moment(formattedGateInDate).format("YYYY-MM-DD"),
      inTime: formData.inTime || "",
      loadStatus: formData.loadStatus || "",
      arrivalExportGetIn: formData.arrivalGateIn || "",
      getInFrom: formData.gateInFrom || "",
      referenceNumber: formData.refrenceNumber || "",
      truckNumber: formData.truckNumber || "",
      operation: "Get In",
      custom: formData.custom || "",
      other: formData.other || "",
      otherSealDescription: formData.otherSealDiscription || "",
      otherRemarks: formData.otherRemarks || "",
      remarks: formData.containerRemarks || "",
      yard: formData.yardName || "",
    };

    // 7. Save logic
    try {
      const response = await operationService.gateIn(payload);

      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED GATE-IN OPERATION FOR ${formData.containerNumber}. WHERE ENTRY ID IS ${response.data.getInContainerId}`
        );
        localStorage.setItem("operation", 10);

        if (formData.loadStatus == "loaded") {
          const confirm = window.confirm(
            `Do you want to do the entry of Stuffing`
          );
          if (confirm) {
            navigate(
              `${process.env.PUBLIC_URL}/app/factory-stuffing/${containerNumber}/${layoutURL}`
            );
          }
        } else {
          navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
        }
      }
    } catch (error) {
      console.error("Gate In Save Error:", error);
      toast.error("Failed to create GateIn");
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading container data...</div>;
  }

  const handleGateInDateChange = (e) => {
    const { name, value } = e.target;
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
    } else if (
      gateOutDate &&
      gateOutDate.isValid() &&
      gateInDateStart.isBefore(gateOutDate)
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Gate In Date cannot be before Gate Out Date",
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
                    <Label className="mb-1">Container Status</Label>
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
                    <label>Yard</label>
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
                    <label>Gate In Date</label>
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
                    <label>Gate In Time</label>
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
                    <label>Load Status</label>
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
                    <label>Gate In From</label>
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
                    <label>Container Condition</label>
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
