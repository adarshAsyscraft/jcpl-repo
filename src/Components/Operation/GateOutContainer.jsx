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
import { Col, Container, Label, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchTransporters } from "../../Redux/slices/transporterSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import moment from "moment";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import FactoryStuffing from "./FactoryStuffing";

const GateOutContainer = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Memoized values
  const currentDate = useMemo(() => moment().format("DD-MM-YYYY"), []);
  const minAllowedDate = useMemo(
    () => moment().subtract(3, "days").format("DD-MM-YYYY"),
    []
  );
  const selectedOperation = useMemo(
    () => location.state?.operation || "1",
    [location.state]
  );

  // State
  const { fetchedContainer } = useSelector((state) => state.container);
  const { icds } = useSelector((state) => state.icd);
  const [arrivalData, setArrivalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState(null);

  // Redux selectors
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  // const { data: containerTypes = [] } = useSelector((state) => state.containerTypes || {});
  const { data: yards, loading: yardsLoading } = useSelector(
    (state) => state.yards || {}
  );
  const transporters = useSelector((state) => state.transporters?.data || []);

  // Form state
  const [formData, setFormData] = useState({
    containerNumber: "",
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "ACEP",
    remarks: "",
    operation: selectedOperation,
    forwarder1: "",
    forwarder2: "",
    transportMode: "",
    yardName: "",
    pol: "",
    shippingLineSeal: "",
    otherRemarks: "",
    loadStatus: "",
    containerStatus: "",
    otherSealDescription: "",
    other: "",
    custom: "",
    shipLine: "",
    truckNumber: "",
    outTime: "",
    outDate: "",
    portPartyName: "",
    refrenceNumber: "",
    transporter: "",
    destinationPlace: "",
    getOutFor: "",
    yard: "",
    icd: "",
    port: "",
    bookingNumber: "",
    anyOtherRemarks: "",
    shippingLineSealNumber: "",
    arrivalDate: "",
    wagonNumber: "",
    entryId: "",
    trainTruckNumber: "",
    lastUpdateDate: "",
    lastUpdatedTime: "",
    containerRemark: "",
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchICDs());
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchTransporters());
  }, [dispatch, containerNumber]);

  // Initialize form data when container data is available
  useEffect(() => {
    if (fetchedContainer?.container_number) {
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
        operation: selectedOperation,
      }));
    }
  }, [fetchedContainer, selectedOperation]);

  // Get previous container details
  let lastOp = localStorage.getItem("operation");
  let res;
  const getPreviousContainerDetails = useCallback(async () => {
    try {
      if (lastOp == "2") {
        res = await operationService.arrivalContainer(containerNumber);
        setLastOperation("Arrival");
      } else if (lastOp == "3") {
        res = await operationService.destuffFCLContainer(containerNumber);
        setLastOperation("Destuff Fcl");
      } else if (lastOp == "4") {
        res = await operationService.destuffLclContainer(containerNumber);
        setLastOperation("Destuff Lcl");
      } else if (lastOp == "10") {
        res = await operationService.getInDataFechByContainerNumber(
          containerNumber
        );
        setLastOperation("Gate In");
      } else if (lastOp == "19") {
        res = await operationService.allotmentStuffingDetailsByContainerNo(
          containerNumber
        );
        setLastOperation("Allotment Stuffing");
      } else if (lastOp == "20") {
        res = await operationService.getAllotmentER(containerNumber);
        setLastOperation("Allotment ER");
      }
      if (res.success) {
        setArrivalData(res.data);
      }
    } catch (error) {
      console.error("Error fetching arrival data:", error);
      toast.error("Failed to load arrival data");
    }
  }, [containerNumber]);

  useEffect(() => {
    getPreviousContainerDetails();
  }, [getPreviousContainerDetails]);

  console.log("Arrival Data::", arrivalData);

  // Update form data when arrival data is available
  useEffect(() => {
    if (arrivalData) {
      setFormData((prev) => ({
        ...prev,
        forwarder1: arrivalData.forwarder1_id || arrivalData.forwarder1Id,
        forwarder2: arrivalData.forwarder2_id || arrivalData.forwarder2Id || "",
        yardName: arrivalData.yard_id || arrivalData.yardId || "",
        containerCondition:
          arrivalData.container_condition ||
          arrivalData.containerCondition ||
          "",
        containerStatus:
          arrivalData.container_status ||
          arrivalData.containerCondition ||
          arrivalData?.status ||
          "",
        bookingNumber:
          arrivalData.booking_number ||
          arrivalData.bookingNumber ||
          arrivalData.booking_no ||
          "",
        arrivalDate:
          moment(arrivalData.arraival_date).format("DD-MM-YYYY") || "",
        loadStatus: arrivalData.load_status || arrivalData.loadStatus || "",
        wagonNumber: arrivalData.wagon_number || "",
        entryId: arrivalData.id || arrivalData,
        trainTruckNumber: arrivalData.train_truck_number || "",
        shippingLineSealNumber:
          arrivalData.seal_no || arrivalData?.ship_line || "",
        anyOtherRemarks:
          arrivalData.other_remarks || arrivalData.anyOtherRemarks || "",
        lastUpdateDate: moment(arrivalData.updated_at).format("DD-MM-YYYY"),
        lastUpdatedTime: arrivalData?.updated_at
          ? new Date(arrivalData?.updated_at).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        shipLine: arrivalData.shipline || "",
        custom: arrivalData.custom || "",
        transporter:
          arrivalData.transporter_id || arrivalData?.transporter || "",
        // custom: arrivalData.custom || "",
        other: arrivalData.other || "",
        otherSealDescription:
          arrivalData.other_description || arrivalData.other_seal_desc || "",
        otherRemarks:
          arrivalData.other_remarks || arrivalData.anyOtherRemarks || "",
        containerRemark: arrivalData.remarks || arrivalData.remark || "",
        container_status: arrivalData.container_status || "",
        allotmentDate: moment(arrivalData.allotment_date).format("DD-MM-YYYY"),
        allotmentType: arrivalData.allotment_type,
        remarks: arrivalData.remarks,
        pdaAccount: arrivalData.pda_account,
        aggrementParty: arrivalData.agreement_party,
        shipper: arrivalData.shipper,
        cargoCategory: arrivalData.cargo_category,
        dischargePortName: arrivalData.discharge_port_name,
        fpd: arrivalData.fpd,
        pol: arrivalData.pol,
        getOutFor:
          arrivalData.allotment_type == "factory-stuffing"
            ? "Factory Stuffing"
            : arrivalData?.gate_out_for || "",
        destinationPlace: arrivalData?.destination_place || "",
        refrenceNumber: arrivalData?.ref_no || "",
        transportMode: arrivalData?.transport_mode || "",
        yard:
          arrivalData?.destination_place || arrivalData?.destinationPlace || "",
        icd:
          arrivalData?.destination_place || arrivalData?.destinationPlace || "",
        port:
          arrivalData?.destination_place || arrivalData?.destinationPlace || "",
      }));
    }
  }, [arrivalData]);
  console.log("formData::", formData);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!formData.outTime) {
      newErrors.outTime = "Out Time is required";
    } else if (!timeRegex.test(formData.outTime)) {
      newErrors.outTime = "Enter Out Time in HH:MM format";
    }

    // Required fields validation
    if (!formData.getOutFor) newErrors.getOutFor = "Get Out For is required";
    if (!formData.outDate) newErrors.outDate = "Out Date is required";
    if (!formData.outTime) newErrors.outTime = "Out Time is required";
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
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name == "otherRemarks" ||
      name == "containerRemark" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    let formattedValue = value;

    // Format outTime to hh:mm if plain digits are typed
    if (name === "outTime") {
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

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }
    const formattedGateOutDate = moment(formData.outDate, "DD-MM-YYYY").format(
      "YYYY-MM-DD"
    );

    setIsLoading(true);

    const payload = {
      containerNumber: formData.containerNumber || "",
      bookingNumber: formData.bookingNumber || "",
      containerStatus: formData.containerStatus || "",
      custom: formData.custom || "",
      destinationPlace: formData.destinationPlace || "",
      forwarder1Id: Number(formData.forwarder1) || "",
      forwarder2Id: Number(formData.forwarder2) || "",
      forwarder1Name:
        forwarders.find((f) => f.id == formData.forwarder1)?.name || "",
      forwarder2Name:
        forwarders.find((f) => f.id == formData.forwarder2)?.name || "",
      operation: "Get Out",
      other: formData.other || "",
      otherRemarks: formData.otherRemarks || "",
      otherSealDescription: formData.otherSealDescription || "",
      outDate: formattedGateOutDate,
      outTime: formData.outTime || "",
      place: formData.place || "Port A",
      refrenceNumber: formData.refrenceNumber || "",
      remarks: formData.containerRemark || "",
      shipline: formData.shippingLineSealNumber || "",
      shippingLineId: formData.shippingLineId || "",
      transporter: Number(formData.transporter) || "",
      truckNumber: formData.trainTruckNumber || "",
      yardId: formData.yardName || "",
      serviceCode: formData.serviceCode || "SC001",
      loadStatus: formData.loadStatus || "",
      outFor: formData.getOutFor || "",
    };

    try {
      const response = await operationService.gateOut(payload);
      if (response.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED GATE-OUT OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.containerId}`
        );
        localStorage.setItem("operation", 11);
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error(response.message || "Failed to save gate out operation");
      }
    } catch (error) {
      console.error("Error saving gate out:", error);
      toast.error("An error occurred while saving gate out operation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGateOutDateChange = (e) => {
    let { name, value } = e.target;

    // Remove all non-digit characters first
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
    const arrival = moment(formData.arrivalDate, "DD-MM-YYYY");

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (inputDate.isAfter(current)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date cannot be more than 3 days in the past",
      }));
    } else if (inputDate.isBefore(arrival)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Out Date cannot be before Arrival Date",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  console.log("Arrival Data::", arrivalData);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Gate Out Container"
        parent="Apps"
        title="Gate Out Container"
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
                <h5 className="mb-3 mt-4">
                  Last Operation {lastOperation} Details
                </h5>

                {/* Common Fields for all operations */}
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Entry Id</Label>
                    <input
                      disabled
                      name="entryId"
                      type="text"
                      className="form-control"
                      value={formData.entryId}
                      readOnly
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Container Number</Label>
                    <input
                      disabled
                      name="containerNumber"
                      type="text"
                      className="form-control"
                      value={formData.containerNumber}
                      readOnly
                    />
                  </Col>
                </Row>

                {/* Operation-specific fields */}
                {lastOp == 19 ? (
                  <>
                    {/* Operation 19 - Allotment Stuffing Fields */}
                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Allotment Date</Label>
                        <input
                          disabled
                          name="allotmentDate"
                          type="text"
                          className="form-control"
                          value={formData.allotmentDate}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Allotment Type</Label>
                        <input
                          disabled
                          name="allotmentType"
                          type="text"
                          className="form-control"
                          value={formData.allotmentType}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">PDA Account</Label>
                        <input
                          disabled
                          name="pdaAccount"
                          type="text"
                          className="form-control"
                          value={formData.pdaAccount}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Agreement Party</Label>
                        <input
                          disabled
                          name="aggrementParty"
                          type="text"
                          className="form-control"
                          value={formData.aggrementParty}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Shipper</Label>
                        <input
                          disabled
                          name="shipper"
                          type="text"
                          className="form-control"
                          value={formData.shipper}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Cargo Category</Label>
                        <input
                          disabled
                          name="cargoCategory"
                          type="text"
                          className="form-control"
                          value={formData.cargoCategory}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Booking Number</Label>
                        <input
                          disabled
                          name="bookingNumber"
                          type="text"
                          className="form-control"
                          value={formData.bookingNumber}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Discharge PORT Name</Label>
                        <input
                          disabled
                          name="dischargePortName"
                          type="text"
                          className="form-control"
                          value={formData.dischargePortName}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">FPD</Label>
                        <input
                          disabled
                          name="fpd"
                          type="text"
                          className="form-control"
                          value={formData.fpd}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">POL</Label>
                        <input
                          disabled
                          name="pol"
                          type="text"
                          className="form-control"
                          value={formData.pol}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Yard Name</Label>
                        <select
                          name="yardName"
                          disabled
                          readOnly
                          className="form-select"
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
                      <Col md="6">
                        <Label className="mb-1">ICD of the Operation</Label>
                        <input
                          disabled
                          name="icdOfTheOperation"
                          type="text"
                          className="form-control"
                          value={formData.icdOfTheOperation}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Entry Person Id</Label>
                        <input
                          disabled
                          name="entryPersonId"
                          type="text"
                          className="form-control"
                          value={formData.entryPersonId}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </>
                ) : lastOp == 20 ? (
                  <>
                    {/* Operation 20 - Get Out Fields */}
                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Load Status</Label>
                        <input
                          disabled
                          name="loadStatus"
                          className="form-control"
                          value={formData.loadStatus}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Transport Mode</Label>
                        <input
                          disabled
                          name="transportMode"
                          className="form-control"
                          value={formData.transportMode}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Yard Name</Label>
                        <select
                          name="yardName"
                          disabled
                          readOnly
                          className="form-select"
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
                      <Col md="6">
                        <Label className="mb-1">Get out for</Label>
                        <input
                          disabled
                          name="getOutFor"
                          className="form-control"
                          value={formData.getOutFor}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Destination place</Label>
                        <input
                          disabled
                          name="destinationPlace"
                          className="form-control"
                          value={formData.destinationPlace}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Transporter</Label>
                        <input
                          disabled
                          name="transporter"
                          className="form-control"
                          value={formData.transporter}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Reference Number</Label>
                        <input
                          disabled
                          name="referenceNumber"
                          className="form-control"
                          value={formData.referenceNumber}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </>
                ) : (
                  <>
                    {/* Default Fields for other operations */}
                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Forwarder1 Code</Label>
                        <input
                          disabled
                          name="forwarder1"
                          className="form-control"
                          value={
                            forwarders.find((f) => f.id == formData.forwarder1)
                              ?.name || ""
                          }
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Forwarder2 Code</Label>
                        <input
                          disabled
                          name="forwarder2"
                          className="form-control"
                          value={
                            forwarders.find((f) => f.id == formData.forwarder2)
                              ?.name || ""
                          }
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Load Status</Label>
                        <input
                          disabled
                          name="loadStatus"
                          className="form-control"
                          value={formData.loadStatus}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">Wagon Number</Label>
                        <input
                          disabled
                          name="wagonNumber"
                          className="form-control"
                          value={formData.wagonNumber}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Train/Truck Number</Label>
                        <input
                          disabled
                          name="trainTruckNumber"
                          className="form-control"
                          readOnly
                          value={formData.trainTruckNumber}
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">{lastOperation} Date</Label>
                        <input
                          disabled
                          name="arrivalDate"
                          className="form-control"
                          value={formData.arrivalDate}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Container Status</Label>
                        <input
                          disabled
                          name="containerStatus"
                          className="form-control"
                          value={formData.containerStatus}
                          readOnly
                        />
                      </Col>
                      <Col md="6">
                        <Label className="mb-1">
                          Shipping Line Seal Number
                        </Label>
                        <input
                          disabled
                          name="shippingLineSealNumber"
                          className="form-control"
                          value={formData.shippingLineSealNumber}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md="6">
                        <Label className="mb-1">Any Other Remarks</Label>
                        <input
                          disabled
                          name="anyOtherRemarks"
                          className="form-control"
                          value={formData.anyOtherRemarks}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </>
                )}

                {/* Common fields for all operations */}
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="mb-1">Last Update Date</Label>
                    <input
                      disabled
                      name="lastUpdateDate"
                      type="text"
                      className="form-control"
                      value={formData.lastUpdateDate}
                      readOnly
                    />
                  </Col>
                  <Col md="6">
                    <Label className="mb-1">Last Update Time</Label>
                    <input
                      disabled
                      name="lastUpdatedTime"
                      type="text"
                      className="form-control"
                      value={formData.lastUpdatedTime || ""}
                      readOnly
                    />
                  </Col>
                </Row>
              </div>

              {/* Client Detail Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Client Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Shipping Line</Label>
                    <select
                      name="shippingLineId"
                      className="form-select form-select-sm"
                      onChange={handleChange}
                      value={formData.shippingLineId}
                      disabled
                    >
                      <option value="">Select Shipping Line</option>
                      {forwardersLoading ? (
                        <option>Loading...</option>
                      ) : (
                        forwarders.map((fwd) => (
                          <option key={fwd.id} value={fwd.id}>
                            {fwd.name}
                          </option>
                        ))
                      )}
                    </select>
                  </Col>
                </Row>
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
                            <option
                              key={fwd.id}
                              value={fwd.id}
                              disabled={fwd.id === formData.forwarder1}
                            >
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

              {/* Booking/Yard Section */}
              <div className="shadow-sm p-4 mt-4">
                <h5 className="mb-3 mt-4">Booking Number/ Yard</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">Booking Number</Label>
                    <input
                      name="bookingNumber"
                      className="form-control"
                      placeholder="Booking Number"
                      onChange={handleChange}
                      value={formData.bookingNumber}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Yard Name</Label>
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
                        yards.map((yard) => (
                          <option key={yard.id} value={yard.id}>
                            {yard.name}
                          </option>
                        ))
                      )}
                    </select>
                  </Col>
                </Row>
              </div>

              {/* Transport Detail Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Transport Detail</h5>
                <Row className="mb-3">
                  <Col md="4">
                    <Label className="large mb-1">Get Out For*</Label>
                    <select
                      name="getOutFor"
                      className={`form-select ${
                        errors.getOutFor ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.getOutFor}
                    >
                      <option value="">Select Get Out For</option>
                      <option value="MOVE TO OTHER ICD SITES">
                        Move to Other ICD
                      </option>
                      <option value="MOVE TO OTHER YARD">
                        Move to Other Yard
                      </option>
                      <option
                        value={
                          formData.loadStatus == "loaded"
                            ? "Factory Destuffing"
                            : "Factory Stuffing"
                        }
                      >
                        {formData.loadStatus == "loaded"
                          ? "Factory Destuffing"
                          : "Factory Stuffing"}
                      </option>
                      {/* <option value="factory-stuffing">Factory Stuffing</option> */}
                      <option value="Dispatch to PORT">Dispatch to PORT</option>
                    </select>
                    {errors.getOutFor && (
                      <div className="invalid-feedback">{errors.getOutFor}</div>
                    )}
                  </Col>
                  <Col md="4">
                    {formData.getOutFor == "MOVE TO OTHER YARD" ? (
                      <>
                        <Label className="large mb-1">Select Yard</Label>

                        <select
                          name="yard"
                          className="form-select"
                          onChange={handleChange}
                          value={formData.yard}
                        >
                          <option value="">Select Yard</option>
                          {yardsLoading ? (
                            <option>Loading...</option>
                          ) : (
                            yards.map((yard) => (
                              <option key={yard.id} value={yard.name}>
                                {yard.name}
                              </option>
                            ))
                          )}
                        </select>
                      </>
                    ) : formData.getOutFor == "MOVE TO OTHER ICD SITES" ? (
                      <>
                        <Label className="large mb-1">Select ICD</Label>
                        <select
                          name="icd"
                          className="form-select"
                          onChange={handleChange}
                          value={formData.icd}
                        >
                          <option value="">Select ICD</option>
                          {icds.map((icd) => (
                            <option key={icd.id} value={icd.name}>
                              {icd.name}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      formData.getOutFor == "Dispatch to PORT" && (
                        <>
                          <Label className="large mb-1">Port Name</Label>
                          <input
                            name="port"
                            className="form-control"
                            placeholder="Enter Port Name"
                            onChange={handleChange}
                            value={formData.port}
                          />
                        </>
                      )
                    )}
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Transporter</Label>
                    <select
                      name="transporter"
                      className="form-select"
                      onChange={handleChange}
                      value={
                        formData.transporter ? String(formData.transporter) : ""
                      }
                    >
                      <option value="">Select Transporter</option>
                      {transporters.map((transporter) => (
                        <option
                          key={transporter.id}
                          value={String(transporter.id)}
                        >
                          {`${transporter.name} -- ${transporter.code}`}
                        </option>
                      ))}
                    </select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md="4">
                    <Label className="large mb-1">Load Status</Label>
                    <select
                      name="loadStatus"
                      className="form-select"
                      onChange={handleChange}
                      value={
                        formData.loadStatus ? formData.loadStatus : "empty"
                      }
                    >
                      <option value="">Load Status</option>
                      <option value="empty">Empty</option>
                      <option value="loaded">Loaded</option>
                    </select>
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Refrence Number</Label>
                    <input
                      name="refrenceNumber"
                      className="form-control"
                      placeholder="refrenceNumber"
                      onChange={handleChange}
                      value={formData.refrenceNumber}
                    />
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Truck Number</Label>
                    <input
                      name="trainTruckNumber"
                      type="text"
                      className="form-control"
                      placeholder="Truck Number"
                      onChange={handleChange}
                      value={formData.trainTruckNumber}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <Label className="large mb-1">Out Date*</Label>
                    <input
                      name="outDate"
                      type="text"
                      className={`form-control ${
                        errors.outDate ? "is-invalid" : ""
                      }`}
                      onChange={handleGateOutDateChange}
                      value={formData.outDate}
                      max={currentDate}
                      min={minAllowedDate}
                      placeholder="DD-MM-YYYY"
                    />
                    {errors.outDate && (
                      <div className="invalid-feedback">{errors.outDate}</div>
                    )}
                  </Col>
                  <Col md="4">
                    <Label className="large mb-1">Out Time*</Label>
                    <input
                      name="outTime"
                      type="text" // changed from "time"
                      placeholder="Enter Out Time (e.g., 11:30)"
                      className={`form-control ${
                        errors.outTime ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={formData.outTime}
                    />
                    {errors.outTime && (
                      <div className="invalid-feedback">{errors.outTime}</div>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Shield Detail Section */}
              <div className="shadow-sm p-4 rounded mt-4">
                <h5 className="mb-3 mt-4">Shield Detail</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <Label className="large mb-1">ShipLine Seal No</Label>
                    <input
                      name="shippingLineSealNumber"
                      type="text"
                      className="form-control"
                      placeholder="ShipLine"
                      onChange={handleChange}
                      value={formData.shippingLineSealNumber}
                    />
                  </Col>
                  <Col md="6">
                    <Label className="large mb-1">Custom</Label>
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
                    <Label className="large mb-1">Other</Label>
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
                    <Label className="large mb-1">Other Seal Description</Label>
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
              </div>

              {/* Container Condition Section */}
              <div className="shadow-sm p-4 rounded mt-4">
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
                      <option value="">Container Status</option>
                      <option value="Sound">Sound</option>
                      <option value="Damage">Damage</option>
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Remarks</label>
                    <textarea
                      name="containerRemark"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.containerRemark}
                      placeholder="Remarks"
                    ></textarea>
                  </Col>
                  <Col md="6">
                    <label>Other Remarks</label>
                    <textarea
                      name="otherRemarks"
                      className="form-control"
                      rows="3"
                      onChange={handleChange}
                      value={formData.otherRemarks}
                      placeholder="Any Other Remarks"
                    ></textarea>
                  </Col>
                </Row>
              </div>

              {/* Save Button */}
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

export default GateOutContainer;
