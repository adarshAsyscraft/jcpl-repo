import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
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
import { toast } from "react-toastify";
import moment from "moment";
import operationService from "../../Services/operation";

const ICDStuffing = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const { fetchedContainer } = useSelector((state) => state.container);
  const [previousPageData, setPreviousPageData] = useState({});
  const lastOperation = localStorage.getItem("operation");

  const [formList, setFormList] = useState([]);
  const [formListContainer, setFormListContainer] = useState([]);
  const [formInitialized, setFormInitialized] = useState(false);
  const selectedOperation = location.state?.operation || "";
  const [vgm, setVGM] = useState(0);
  const [vgmDiff, setVgmDiff] = useState(0);
  const [errors, setErrors] = useState([]);

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
    stuffingDate: "",
    cargoCategory: "",
    vgmByShipper: "",
    hsCode: "",
    bookingNumber: "",
    yardId: "",
    dischargePortName: "",
    fpd: "",
    pdaAccount: "",
    aggrementParty: "",
    vesselViaNumber: "",
    imoNumber: "",
    unNumber: "",
    temprature: "",
    custom: "",
    excise: "",
    other: "",
    otherSealRemarks: "",
    remarks: "",
    anyOtherRemarks: "",
    containerRemarks:
      "1. CONTAINER STUFFED IN SOUND CONDITION. 2. CARGO DETAILS/WEIGHT AS DECLARED IN THE SHIPPING BILL/INVOICE, ALL PACKAGES STUFFED ARE INSPECTED TO EXTERNAL CONDITION ONLY.",
  });

  const cargoFieldLabels = {
    shipBillNumber: "Ship Bill Number",
    shipBillDate: "Ship Bill Date",
    shipperName: "Shipper Name",
    consigneeName: "Consignee Name",
    cargo: "Cargo",
    cargoWeightInKg: "Cargo Weight (in kg)",
    cbm: "CBM",
    packedIn: "Packed In",
    qtyManifest: "Quantity Manifest",
    marks: "Marks",
    number: "Number",
    remarks: "Remarks",
  };

  const containerFieldLabels = {
    containerNumber: "Container Number",
    cargoWeightInKg: "Cargo Weight (in kg)",
    vgmByShipper: "VGM by Shipper",
    packedIn: "Packed In",
    qtyManifest: "Quantity Manifest",
    marks: "Marks",
    shipline: "Shipping Line",
    custom: "Custom",
    remarks: "Remarks",
  };

  const addForm = useCallback(() => {
    if (Object.keys(previousPageData).length > 0) {
      const cargoDetail = previousPageData || {};
      setFormList((prev) => [
        ...prev,
        {
          shipBillNumber: cargoDetail.shipp_bill_no || "",
          shipBillDate:
            moment(cargoDetail.s_bill_date).format("DD-MM-YYYY") || "",
          shipperName: cargoDetail.shipper || "",
          consigneeName: cargoDetail.consignee_name || "",
          cargo: cargoDetail.cargo || "",
          "cargoWeight (in kg)": cargoDetail.cargo_wt_kgs || "0.000",
          cbm: cargoDetail.cbm || "0.000",
          packedIn: cargoDetail.packed_in || "",
          packages: cargoDetail.packages || "0",
          marks: cargoDetail.marks || "",
          number: cargoDetail.number || "",
          remarks: "",
          id: Date.now(),
          slNo: prev.length + 1,
        },
      ]);
      setFormInitialized(true);
    } else {
      setFormList((prev) => [
        ...prev,
        {
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
          id: Date.now(),
          slNo: prev.length + 1,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(previousPageData).length > 0 && !formInitialized) {
      const cargoDetail = previousPageData;
      setFormList([
        {
          shipBillNumber: cargoDetail.shipp_bill_no || "",
          shipBillDate:
            moment(cargoDetail.s_bill_date).format("DD-MM-YYYY") || "",
          shipperName: cargoDetail.shipper || "",
          consigneeName: cargoDetail.consignee_name || "",
          cargo: cargoDetail.cargo || "",
          "cargoWeight (in kg)": cargoDetail.cargo_wt_kgs || "0.000",
          cbm: cargoDetail.cbm || "0.000",
          packedIn: cargoDetail.packed_in || "",
          packages: cargoDetail.packages || "0",
          marks: cargoDetail.marks || "",
          number: cargoDetail.number || "",
          remarks: "",
          id: Date.now(),
          slNo: 1,
        },
      ]);
      setFormInitialized(true);
    }
  }, [previousPageData, formInitialized]);

  const cancelForm = (index) => {
    setFormList((prev) => prev.filter((_, i) => i !== index));
  };

  const addContainer = () => {
    setFormListContainer((prevForms) => [
      ...prevForms,
      {
        id: Date.now(),
        slNo: prevForms.length + 1,
        containerNumber: "",
        cargoWeightInKg: "0.000",
        vgmByShipper: "",
        packedIn: "",
        qtyManifest: "0",
        marks: "",
        shipline: "",
        custom: "",
        remarks: "",
      },
    ]);
  };

  const cancelContainerForm = (index) => {
    setFormListContainer((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    if (field === "shipBillDate") {
      value = value.replace(/\D/g, "");
      if (value.length > 8) value = value.slice(0, 8);

      if (value.length > 4) {
        value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
      } else if (value.length > 2) {
        value = `${value.slice(0, 2)}-${value.slice(2)}`;
      }

      if (value.length === 10) {
        const datePattern = /^(\d{2})([-/.])(\d{2})\2(\d{4})$/;
        const match = value.match(datePattern);

        setErrors((prev) => {
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
    } else {
      value = value.toUpperCase();
    }

    setFormList((prevForms) =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      )
    );
  };

  const handleChanges = (index, field, value) => {
    const updatedForms = [...formListContainer];
    updatedForms[index][field] = value;
    setFormListContainer(updatedForms);
  };

  const totalCargoWeight = formListContainer.reduce(
    (sum, form) => sum + parseFloat(form["cargoWeightInKg"] || 0),
    0
  );
  const totalQtyManifest = formListContainer.reduce(
    (sum, form) => sum + parseInt(form.qtyManifest || 0),
    0
  );

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name == "containerRemarks" ||
      name == "anyOtherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

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
  };

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

  const handleSave = async () => {
    const mandatoryFields = {
      stuffingDate: "Stuffing Date",
      cargoCategory: "Cargo Category",
      yardName: "Yard Name",
      vgmByShipper: "VGM By Shipper",
      containerStatus: "Container Status",
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
    for (let i = 0; i < formList.length; i++) {
      const dateValue = formList[i]?.shipBillDate?.trim() || "";

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
      containerNumber: fetchedContainer?.container_number,
      forwarder1: formData.forwarder1 || null,
      carting_number: Math.random(formData.carting_number) || "CART12345633",
      forwarder2: formData.forwarder2 || null,
      transportMode: formData.transportMode || null,
      loadStatus: formData.loadStatus || null,
      yardName: formData.yardName || null,
      pol: formData.pol || null,
      shippingLineSeal: formData.shippingLineSeal || null,
      containerCondition: formData.containerCondition || null,
      anyOtherCondition: formData.anyOtherCondition || null,
      stuffingDate:
        moment(formData.stuffingDate, "DD-MM-YYYY").format("YYYY-MM-DD") ||
        null,
      cargoCategory: formData.cargoCategory || null,
      vgmByShipper: formData.vgmByShipper || null,
      hsCode: formData.hsCode || null,
      bookingNo: formData.bookingNumber || null,
      yardId: formData.yardId || formData.yardName || null,
      dischargePortName: formData.dischargePortName || null,
      fpd: formData.fpd || null,
      pdaAccount: formData.pdaAccount || null,
      aggrementParty: formData.aggrementParty || null,
      vesselByNo: formData.vesselViaNumber || null,
      imoNumber: formData.imoNumber || null,
      unNumber: formData.unNumber || null,
      temprature: formData.temprature || null,
      shipline: formData.shippingLine || null,
      custom: formData.custom || null,
      excise: formData.excise || null,
      other: formData.other || null,
      otherSealRemarks: formData.otherSealRemarks || null,
      containerStatus: formData.containerCondition || null,
      remark: formData.containerRemarks || null,
      anyOtherRemarks: formData.anyOtherRemarks || null,
      totalCargoWeight: formData.totalCargoWeight,
      totalCbm: formData.totalCbm,
      totalQtyManifest: formData.totalQtyManifest,
      hsCode: formData?.hsCode || "",
      totalVGM: vgm,
      cargoDetails: formList,
      containerDetailsList: formListContainer,
    };

    const res = await operationService.icdStuffing(payload);
    if (res.success) {
      localStorage.setItem("operation", 6);
      navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED FACTORY STUFFING OPERATION FOR ${formData.containerNumber}. WHERE ENTRY ID IS ${res.message.id}`
      );
    }
  };

  useEffect(() => {
    console.log("formList::", formList);
    const totalCargoWeight = formList.reduce(
      (sum, item) => sum + parseFloat(item["cargoWeight (in kg)"] || 0),
      0
    );
    const totalCbm = formList.reduce(
      (sum, item) => sum + parseFloat(item.cbm || 0),
      0
    );
    const totalQtyManifest = formList.reduce(
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
  }, [formList]);

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    console.log("container number::", containerNumber);
  }, []);

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
  }, [dispatch]);

  const {
    data: forwarders = [],
    loading: forwardersLoading,
    error: forwardersError,
  } = useSelector((state) => state.forwarders || {});
  const {
    data: containerTypes = [],
    loading: containerTypesLoading,
    error: containerTypesError,
  } = useSelector((state) => state.containerTypes || {});
  const {
    data = [],
    loading: yardsLoading,
    error: yardsError,
  } = useSelector((state) => state.yards || {});

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
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
    }));
  }, [containerNumber, fetchedContainer]);

  const handleChange1 = () => {};

  const previsousStateData = async () => {
    const containerNumber =
      fetchedContainer?.container_number || formData.containerNumber;

    if (lastOperation == "19") {
      const res = await operationService.allotmentStuffingDetailsByContainerNo(
        containerNumber
      );
      if (res.success) {
        setPreviousPageData(res.data);
      }
    } else if (lastOperation == "2") {
      const res = await operationService.arrivalContainer(containerNumber);
      if (res.success) {
        console.log("Arrival Data::", res);
        setFormData((prev) => ({
          ...prev,
          yardName: res.data.yard_id,
        }));
      }
    } else if (lastOperation == "3") {
      const res = await operationService.destuffFCLContainer(containerNumber);
      if (res.success) {
        console.log("FCL Data::", res);
        setFormData((prev) => ({
          ...prev,
          yardName: res.data.yardId,
        }));
      }
    } else if (lastOperation == "4") {
      const res = await operationService.destuffLclContainer(containerNumber);
      if (res.success) {
        console.log("LCL Data::", res);
        setFormData((prev) => ({
          ...prev,
          yardName: res.data.yardId,
        }));
      }
    } else if (lastOperation == "5") {
      const res = await operationService.destuffLclRequestContainer(
        containerNumber
      );
      if (res.success) {
        console.log("Request Data::", res);
        setFormData((prev) => ({
          ...prev,
          yardName: res.data.yardId,
        }));
      }
    }
  };

  useEffect(() => {
    previsousStateData();
  }, [containerNumber]);

  useEffect(() => {
    // if (previousPageData.allotmentType == "icd-stuffing") {
    setFormData((prev) => ({
      ...prev,
      // stuffingDate: moment(previousPageData?.inDate).format("DD-MM-YYYY"),
      cargoCategory: previousPageData.cargo_category,
      imoNumber: previousPageData.imo_number,
      unNumber: previousPageData.un_number,
      bookingNumber: previousPageData.booking_no,
      yardName: previousPageData.yard_id,
      pol: previousPageData.pol,
      dischargePortName: previousPageData.discharge_port_name,
      fpd: previousPageData.fpd,
      pdaAccount: previousPageData.pda_account,
      aggrementParty: previousPageData.agreement_party,
      vesselViaNumber: previousPageData.vessel_via_no,
      placeOfHandOver: previousPageData.place_of_handover,
      shippingLine: previousPageData?.ship_line || "",
      custom: previousPageData.custom,
      other: previousPageData.other,
      otherSealRemarks: previousPageData.other_seal_desc,
      containerStatus: previousPageData.containerStatus || "",
      // remarks: previousPageData.remark,
    }));
    // }
  }, [previousPageData]);

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="ICD Stuffing of Container"
        parent="Apps"
        title="ICD Stuffing of Container"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange1}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />
              <div className="card shadow p-4">
                <h5 className="mb-3 mt-5">Stuffing Details</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label htmlFor="">Forwarder1 Code Name</label>
                    <select
                      name="forwarder1"
                      className="form-select form-select-sm"
                      onChange={handleChange}
                      value={String(formData.forwarder1)}
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
                      onChange={handleChange}
                      value={String(formData.forwarder2)}
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
                      placeholder="Stuffing Date"
                      onChange={handleDateChange}
                      max={currentDate}
                      min={minAllowedDate}
                      value={formData.stuffingDate}
                    />
                    {errors.stuffingDate && (
                      <div className="invalid-feedback">
                        {errors.stuffingDate}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label>
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
                    >
                      <option value="">Select Cargo Category</option>
                      <option value="hazardous">Hazardous</option>
                      <option value="non-hazardous">Non Hazardous</option>
                      <option value="reefer">Reefer</option>
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
                      <label>
                        IMO Number{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </label>
                      <input
                        name="imoNumber"
                        type="text"
                        className={`form-control ${
                          errors.imoNumber ? "is-invalid" : ""
                        }`}
                        placeholder="IMO Number"
                        onChange={handleChange}
                        value={formData.imoNumber}
                      />
                      {errors.imoNumber && (
                        <div className="invalid-feedback">
                          {errors.imoNumber}
                        </div>
                      )}
                    </Col>
                    <Col md="6">
                      <label>
                        UN Number{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </label>
                      <input
                        name="unNumber"
                        type="text"
                        className={`form-control ${
                          errors.unNumber ? "is-invalid" : ""
                        }`}
                        placeholder="UN Number"
                        onChange={handleChange}
                        value={formData.unNumber}
                      />
                      {errors.unNumber && (
                        <div className="invalid-feedback">
                          {errors.unNumber}
                        </div>
                      )}
                    </Col>
                  </Row>
                )}

                {(formData.cargoCategory === "reefer" ||
                  formData.cargoCategory === "both") && (
                  <Row className="mb-3">
                    <Col md="6">
                      <label>
                        Temperature{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </label>
                      <input
                        name="temprature"
                        type="text"
                        className={`form-control ${
                          errors.temprature ? "is-invalid" : ""
                        }`}
                        placeholder="Temperature"
                        onChange={handleChange}
                        value={formData.temprature}
                      />
                      {errors.temprature && (
                        <div className="invalid-feedback">
                          {errors.temprature}
                        </div>
                      )}
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
                      disabled={previousPageData.yard_id}
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
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>POL</label>
                    <input
                      name="pol"
                      type="text"
                      className="form-control"
                      placeholder="POL"
                      onChange={handleChange}
                      value={formData.pol}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Discharge PORT Name</label>
                    <input
                      name="dischargePortName"
                      type="text"
                      className="form-control"
                      placeholder="Discharge PORT Name"
                      onChange={handleChange}
                      value={formData.dischargePortName}
                    />
                  </Col>
                  <Col md="6">
                    <label>FPD</label>
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
                    <label>PDA Account</label>
                    <select
                      name="pdaAccount"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.pdaAccount}
                    >
                      <option value="">Select PDA </option>
                      <option value="shipper pda">Shipper PDA</option>
                      <option value="liner pda">Liner PDA</option>
                    </select>
                  </Col>
                  <Col md="6">
                    <label>Aggrement Party</label>
                    <input
                      name="aggrementParty"
                      type="text"
                      className="form-control"
                      placeholder="Aggrement Party"
                      onChange={handleChange}
                      value={formData.aggrementParty}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
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
                      placeholder="VGM By Shipper"
                      onChange={handleChange}
                      value={formData.vgmByShipper}
                    />
                    {errors.vgmByShipper && (
                      <div className="invalid-feedback">
                        {errors.vgmByShipper}
                      </div>
                    )}
                  </Col>
                  <Col md="6">
                    <label>HS Code</label>
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
                    <label>Vessel/Via Number</label>
                    <input
                      name="vesselViaNumber"
                      type="text"
                      className="form-control"
                      placeholder="Vessel Via Number"
                      onChange={handleChange}
                      value={formData.vesselViaNumber}
                    />
                  </Col>
                  <Col md="6">
                    <label>Place Of Handover</label>
                    <input
                      name="placeOfHandOver"
                      type="text"
                      className="form-control"
                      placeholder="Place of Handover"
                      onChange={handleChange}
                      value={formData.placeOfHandOver}
                    />
                  </Col>
                </Row>
              </div>
              <div>
                <div className="shadow-sm p-4  mt-4">
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <button className="btn btn-primary w-25" onClick={addForm}>
                      Proceed to enter Cargo Detail
                    </button>
                    <span className="badge bg-info fs-6">
                      Forms Open: {formList.length}
                    </span>
                  </div>

                  {formList.map((formData, index) => (
                    <div key={formData.id} className="mt-4 p-4 border rounded">
                      <h3 className="font-semibold mb-2">
                        Cargo Detail - SL No: {formData.slNo}
                      </h3>
                      <div className="row">
                        {Object.keys(formData).map(
                          (field) =>
                            field !== "slNo" &&
                            field !== "id" && (
                              <div key={field} className="col-md-4 mb-2">
                                <label className="form-label">
                                  {cargoFieldLabels[field] || field}
                                </label>
                                {field === "shipBillDate" ? (
                                  <>
                                    <input
                                      type="text"
                                      value={String(
                                        formData[field]
                                      ).toUpperCase()}
                                      onChange={(e) =>
                                        handleInputChange(
                                          index,
                                          field,
                                          e.target.value
                                        )
                                      }
                                      className={`form-control ${
                                        errors[index]?.shipBillDate
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      placeholder="DD-MM-YYYY"
                                    />
                                    {errors[index]?.shipBillDate && (
                                      <div className="invalid-feedback">
                                        {errors[index].shipBillDate}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <input
                                    type="text"
                                    value={String(
                                      formData[field]
                                    ).toUpperCase()}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        field,
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                  />
                                )}
                              </div>
                            )
                        )}
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

                  <h5 className="mb-3 mt-4">Total Calculated Values</h5>
                  <Row className="mb-3">
                    <Col md="4">
                      <label htmlFor="">Total Cargo Weight</label>
                      <input
                        readOnly
                        name="totalCargoWeight"
                        className="form-control"
                        placeholder="Total Cargo Weight"
                        onChange={handleChange}
                        value={formData.totalCargoWeight}
                      />
                    </Col>
                    <Col md="4">
                      <label htmlFor="">Total CBM</label>
                      <input
                        readOnly
                        name="totalCbm"
                        className="form-control"
                        placeholder="Total CBM"
                        onChange={handleChange}
                        value={formData.totalCbm}
                      />
                    </Col>
                    <Col md="4">
                      <label htmlFor="">Total Qty Manifest</label>
                      <input
                        readOnly
                        name="totalQtyManifest"
                        className="form-control"
                        placeholder="Total Quantity Manifest"
                        onChange={handleChange}
                        value={formData.totalQtyManifest}
                      />
                    </Col>
                  </Row>
                  {/* Add Container Button */}
                  {/* Container Form Section */}
                  <Row className="mb-3 d-flex justify-content-between align-items-center">
                    <Col md="4">
                      <button
                        onClick={addContainer}
                        className="btn btn-primary"
                      >
                        Add Container
                      </button>
                    </Col>
                    <Col md="4">
                      <span className="badge bg-warning fs-6">
                        Containers Open: {formListContainer.length}
                      </span>
                    </Col>
                  </Row>

                  {formListContainer.map((formData, index) => (
                    <div key={formData.id} className="mt-2 p-4 border rounded">
                      <div className="row">
                        {Object.keys(formData).map(
                          (field) =>
                            field !== "slNo" &&
                            field !== "id" && (
                              <div key={field} className="col-md-4 mb-2">
                                <label className="form-label">
                                  {containerFieldLabels[field] || field}
                                </label>
                                <input
                                  name={field}
                                  type={
                                    ["cargoWeightInKg", "qtyManifest"].includes(
                                      field
                                    )
                                      ? "number"
                                      : "text"
                                  }
                                  value={formData[field]}
                                  onChange={(e) =>
                                    handleChanges(index, field, e.target.value)
                                  }
                                  className="form-control"
                                />
                              </div>
                            )
                        )}
                      </div>
                      <div className="d-flex justify-content-end col-12">
                        <button
                          onClick={() => cancelContainerForm(index)}
                          className="btn btn-danger mt-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Display Total Cargo Weight & Quantity Manifest */}

                  <Row className="mt-4 p-3 border rounded bg-light text-dark">
                    <Col md="6">
                      <label className="form-label">
                        <strong>Total Cargo Weight (kg):</strong>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={totalCargoWeight.toFixed(3)}
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
                        value={totalQtyManifest}
                        readOnly
                      />
                    </Col>
                  </Row>
                </div>
                <div className="shadow-sm p-4  mt-4">
                  <h6 className="mt-5">Seal Details</h6>
                  <Row className="mb-3">
                    <Col md="6">
                      <label htmlFor="">Shipline</label>
                      <input
                        name="shippingLine"
                        type="text"
                        className="form-control"
                        placeholder="Shipline"
                        onChange={handleChange}
                        value={formData.shippingLine}
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
                      <label htmlFor="">Excise</label>
                      <input
                        name="excise"
                        type="text"
                        className="form-control"
                        placeholder="Excise"
                        onChange={handleChange}
                        value={formData.excise}
                      />
                    </Col>
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
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <label htmlFor="">Other Seal Remarks</label>
                      <input
                        name="otherSealRemarks"
                        type="text"
                        className="form-control"
                        placeholder="Other Seal Remarks"
                        onChange={handleChange}
                        value={formData.otherSealRemarks}
                      />
                    </Col>
                  </Row>
                </div>
                <div className="shadow-sm p-4  mt-4">
                  <h6 className="mt-5">Container Condition</h6>
                  <Row className="mb-3">
                    <Col md="6">
                      <label>
                        Container Status{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </label>
                      <select
                        name="containerCondition"
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
                        name="containerRemarks"
                        className="form-control"
                        rows="3"
                        onChange={handleChange}
                        value={formData.containerRemarks}
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

export default ICDStuffing;
