import React, { Fragment, useContext, useEffect, useState } from "react";
import { Col, Container, Row, Table, Label } from "reactstrap";
import { Select } from "antd";
import ContainerDetailsSection from "./containerDetails";
import { Breadcrumbs } from "../../AbstractElements";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import moment from "moment";
import operationService from "../../Services/operation";
import CustomizerContext from "../../_helper/Customizer";

function StuffingProcessFetchDetails({
  fetchedContainer,
  forwarders,
  forwardersLoading,
}) {
  const [dataByCartingNumber, setDataByCartingNumber] = useState([]);
  const location = useLocation();
  const forwardersState = useSelector((state) => state.forwarders || {});
  const yardsState = useSelector((state) => state.yards || {});
  const yards = yardsState?.data || [];
  const dispatch = useDispatch();
  const containerNumber = location.state?.containerNumber || "";
  const [errors, setErrors] = useState({});
  const { Option } = Select;
  const [previousPageData, setPreviousPageData] = useState({});
  const [stuffingData, setStuggingData] = useState({});
  const [allotmentData, setAllotmentData] = useState({});
  const navigate = useNavigate();
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const { layoutURL } = useContext(CustomizerContext);

  const [formData, setFormData] = useState({
    containerNumber: "",
    shippingLineId: "",
    size: "",
    type: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: "",
    cscValidity: "",
    shippingLine: "",
    forwarder1: "",
    forwarder2: "",
    stuffingDate: "",
    cargoCategory: "",
    unNumber: "",
    imoNumber: "",
    temperature: "",
    bookingNo: "",
    yardId: "",
    dischargePortName: "",
    pol: "",
    pdaAccount: "",
    fpd: "",
    hsCode: "",
    aggrementParty: "",
    vgmByShipper: "",
    vesselViaNumber: "",
    placeOfHandOver: "",
    shipline: "",
    custom: "",
    other: "",
    containerRemarks:
      "1. CONTAINER STUFFED IN SOUND CONDITION. 2. CARGO DETAILS/WEIGHT AS DECLARED IN THE SHIPPING BILL/INVOICE, ALL PACKAGES STUFFED ARE INSPECTED TO EXTERNAL CONDITION ONLY.",
    anyOtherRemarks: "",
  });

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchYards());
  }, [dispatch]);

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
    }));
  }, [fetchedContainer]);

  const getPreviousData = async () => {
    const lastOp = localStorage.getItem("operation");
    const containerNumber = fetchedContainer?.container_number;
    if (!containerNumber) return;

    try {
      let stuffingRes = null;
      let allotmentRes = null;

      if (lastOp == "19") {
        allotmentRes =
          await operationService.allotmentStuffingDetailsByContainerNo(
            containerNumber
          );
        if (allotmentRes.success) {
          setAllotmentData(allotmentRes.data);
        }
      } else if (lastOp == "9") {
        stuffingRes = await operationService.getStuffingLclDetails(
          containerNumber
        );
        allotmentRes =
          await operationService.allotmentStuffingDetailsByContainerNo(
            containerNumber
          );

        const stuffing =
          stuffingRes?.success && stuffingRes?.data?.length > 0
            ? stuffingRes.data[0]
            : null;
        const allotment = allotmentRes?.success ? allotmentRes.data : null;

        if (stuffing) setStuggingData(stuffing);
        if (allotment) setAllotmentData(allotment);

        // Now set formData conditionally
        const hasAllotment = allotment && Object.keys(allotment).length > 0;

        setFormData((prev) => ({
          ...prev,
          cargoCategory: hasAllotment
            ? allotment.cargo_category
            : stuffing?.cargo_category,
          unNumber: hasAllotment ? allotment.un_number : stuffing?.un_number,
          imoNumber: hasAllotment ? allotment.imo_number : stuffing?.imo_number,
          temperature: hasAllotment
            ? allotment.temperature
            : stuffing?.temperature,
          bookingNo: hasAllotment ? allotment.booking_no : stuffing?.booking_no,
          yardId: hasAllotment ? allotment.yard_id : stuffing?.yard_id,
          pol: stuffing?.pol || "",
          pod: stuffing?.pod || "",
          dischargePortName:
            stuffing?.discharge_port_name || stuffing?.pod || "",
          fpd: stuffing?.fpd || "",
          pdaAccount: hasAllotment
            ? allotment.pda_account
            : stuffing?.pda_account,
          aggrementParty: hasAllotment
            ? allotment.agreement_party
            : stuffing?.agreement_party,
          vesselViaNumber: hasAllotment
            ? allotment.vessel_via_no
            : stuffing?.vessel_via_no,
          placeOfHandOver: hasAllotment
            ? allotment.place_of_handover
            : stuffing?.place_of_handover,
          shipline: stuffing?.ship_line || stuffing?.shipping_line_seal || "",
          custom: stuffing?.custom || stuffing?.custom_seal || "",
          other: hasAllotment ? allotment.other : stuffing?.other,
          otherSealRemarks: hasAllotment
            ? allotment.other_seal_desc
            : stuffing?.other_seal_desc,
          // containerRemarks: hasAllotment ? allotment.remark : stuffing?.remark,
        }));
      }
    } catch (error) {
      console.error("Error fetching previous data:", error);
    }
  };

  const fetchCartingDetails = async () => {
    try {
      const containerNumber = fetchedContainer?.container_number;

      const queryParams = {
        containerNumber,
      };

      if (!containerNumber) {
        console.warn("No container number found. Skipping fetch.");
        return;
      }

      console.log("Fetching carting details for:", containerNumber);

      const res = await operationService.getCartingDetails(queryParams);

      console.log("Carting details response:", res);

      if (res.success) {
        setDataByCartingNumber(res.data || {});
      } else {
        toast.error(res.message || "Failed to fetch carting details");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Something went wrong while fetching details.");
    }
  };

  useEffect(() => {
    fetchCartingDetails();
    getPreviousData();
  }, [containerNumber, fetchedContainer?.container_number]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (
      name == "remarks" ||
      name == "anyOtherRemarks" ||
      e.target.type == "text"
    ) {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
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
    } else if (inputDate.isAfter(current)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Date cannot be in the future",
      }));
    } else if (inputDate.isBefore(minimum)) {
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
  };

  const handleSubmit = async () => {
    try {
      const mandatoryFields = {
        stuffingDate: "Stuffing Date",
        cargoCategory: "Cargo Category",
        yardId: "Yard Name",
        pdaAccount: "PDA Account",
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

      const payload = {
        container_id: fetchedContainer.id,
        shippingLine: formData.shippingLine || null,
        forwarder1: formData.forwarder1 || null,
        forwarder2: formData.forwarder2 || null,
        stuffingDate:
          moment(formData.stuffingDate, "DD-MM-YYYY").format("YYYY-MM-DD") ||
          null,
        cargoCategory: formData.cargoCategory || null,
        unNumber: formData.unNumber || null,
        imoNumber: formData.imoNumber || null,
        temperature: formData.temperature || null,
        bookingNo: formData.bookingNo || null,
        yardId: formData.yardId || null,
        dischargePortName: formData.dischargePortName || null,
        pol: formData.pol || null,
        pdaAccount: formData.pdaAccount || null,
        fpd: formData.fpd || null,
        hsCode: formData.hsCode || null,
        aggrementParty: formData.aggrementParty || null,
        vgmByShipper: formData.vgmByShipper || null,
        vesselViaNumber: formData.vesselViaNumber || null,
        placeOfHandOver: formData.placeOfHandOver || null,
        shipline: formData.shipline || null,
        custom: formData.custom || null,
        other: formData.other || null,
        remarks: formData.containerRemarks || null,
        anyOtherRemarks: formData.anyOtherRemarks || null,
      };
      const res = await operationService.stuffingProceed(payload);
      if (res.success) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED STUFFING-LCL OPERATION FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${res.data.id}`
        );
        localStorage.setItem("operation", 24);
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      }
    } catch (error) {
      console.log("Unable to fetch data");
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Stuffing Details"
        parent="Apps"
        title="Stuffing Details"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <ContainerDetailsSection
                formData={formData}
                handleChange={handleChange}
                forwarders={forwarders}
                forwardersLoading={forwardersLoading.loading}
                fetchedContainer={fetchedContainer}
                disabled={true}
              />
              <div className="table-responsive rounded shadow-sm border my-3">
                <Table
                  className="text-center align-middle mb-0 table-responsive"
                  style={{
                    backgroundColor: "#ffffff",
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  <thead style={{ backgroundColor: "#dddddd" }}>
                    <tr>
                      <th style={{ width: "60px" }}>S.NO.</th>
                      <th style={{ width: "120px" }}>Forwarder Code</th>
                      <th style={{ width: "130px" }}>Ship Bill Number</th>
                      <th style={{ width: "110px" }}>Ship Bill Date</th>
                      <th style={{ width: "150px", whiteSpace: "normal" }}>
                        Shipper Name
                      </th>
                      <th style={{ width: "150px", whiteSpace: "normal" }}>
                        Consignee Name
                      </th>
                      <th style={{ width: "100px" }}>Cargo Type</th>
                      <th style={{ width: "110px" }}>Cargo Weight</th>
                      <th style={{ width: "100px" }}>Packed In</th>
                      <th style={{ width: "100px" }}>Packages</th>
                      <th style={{ width: "90px" }}>CBM</th>
                      <th style={{ width: "150px", whiteSpace: "normal" }}>
                        Marks
                      </th>
                      <th style={{ width: "150px", whiteSpace: "normal" }}>
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(dataByCartingNumber) &&
                    dataByCartingNumber.length > 0 ? (
                      <>
                        {dataByCartingNumber.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {item.shipping_line_forwarder_name || "N/A"}
                            </td>
                            <td>{item.ship_bill_number || "N/A"}</td>
                            <td>
                              {moment(item.ship_bill_date).format(
                                "DD-MM-YYYY"
                              ) || "N/A"}
                            </td>
                            <td style={{ wordWrap: "break-word" }}>
                              {item.shipper || "N/A"}
                            </td>
                            <td style={{ wordWrap: "break-word" }}>
                              {item.consignee || "N/A"}
                            </td>
                            <td>{item.cargo || "N/A"}</td>
                            <td>
                              {item.cargo_weight
                                ? `${item.cargo_weight}`
                                : "N/A"}
                            </td>
                            <td>{item.packed_in || "N/A"}</td>
                            <td>{item.packages || "N/A"}</td>
                            <td>
                              {item.cbm != null
                                ? parseFloat(item.cbm).toFixed(3)
                                : "N/A"}
                            </td>

                            <td style={{ wordWrap: "break-word" }}>
                              {item.marks || "N/A"}
                            </td>
                            <td style={{ wordWrap: "break-word" }}>
                              {item.remarks || "N/A"}
                            </td>
                          </tr>
                        ))}

                        {/* Footer row with totals */}
                        <tr
                          style={{
                            backgroundColor: "#f8f9fa",
                            fontWeight: "bold",
                          }}
                        >
                          <td colSpan="7" className="text-end">
                            Total
                          </td>
                          <td>
                            {dataByCartingNumber
                              .reduce(
                                (sum, item) =>
                                  sum + (parseFloat(item.cargo_weight) || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                          </td>
                          <td></td>
                          <td>
                            {dataByCartingNumber
                              .reduce(
                                (sum, item) =>
                                  sum + (parseFloat(item.packages) || 0),
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td>
                            {dataByCartingNumber
                              .reduce(
                                (sum, item) =>
                                  sum + (parseFloat(item.cbm) || 0),
                                0
                              )
                              .toFixed(3)}
                          </td>
                          <td colSpan="3"></td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="14" className="text-center text-muted">
                          No data found. Please search by Carting ID or Ship
                          Bill Number.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="clientDetails">
                <Table>
                  <h5 className="mb-3 mt-4">Client Detail</h5>
                  <Row className="mb-3">
                    <Col md="6">
                      <Label className="large mb-1">Shipping Line</Label>
                      <select
                        name="shippingLineId"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.shippingLineId}
                        disabled
                      >
                        <option value="">Select Shipping Line</option>
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
                      <label>Forwarder1 Name</label>
                      <select
                        name="forwarder1"
                        className="form-select"
                        onChange={handleChange}
                        value={formData.forwarder1}
                      >
                        <option value="">Select Forwarder1 Code Name</option>
                        {forwarders
                          .filter((res) => res.category == "forwarder")
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
                          .filter((res) => res.category == "forwarder")
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </Col>
                  </Row>

                  <h5 className="mb-3">Stuffing Details</h5>
                  <Row className="mb-3">
                    <Col md="6">
                      <Label>
                        Stuffing Date{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </Label>
                      <input
                        type="text"
                        name="stuffingDate"
                        className={`form-control ${
                          errors.stuffingDate ? "is-invalid" : ""
                        }`}
                        placeholder="DD-MM-YYYY"
                        onChange={handleDateChange}
                        value={formData.stuffingDate}
                      />
                      {errors?.stuffingDate && (
                        <div className="text-danger">{errors.stuffingDate}</div>
                      )}
                    </Col>
                    <Col md="6">
                      <label htmlFor="">
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
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="hazardous">Hazardous</option>
                        <option value="non-hazardous">Non Hazardous</option>
                        <option value="refer">Refer</option>
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
                    formData.cargoCategory === "both") && (
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
                      <Label>Booking No.</Label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        name="bookingNo"
                        value={formData.bookingNo}
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
                          errors.yardId ? "is-invalid" : ""
                        }`}
                      >
                        <option value="">Select Yard</option>
                        {yards.map((yard) => (
                          <option key={yard.id} value={yard.id}>
                            {yard.name}
                          </option>
                        ))}
                      </select>
                      {errors.yardId && (
                        <div className="invalid-feedback">{errors.yardId}</div>
                      )}
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md="6">
                      <Label>Discharge Port Name</Label>
                      <input
                        type="text"
                        className="form-control"
                        name="dischargePortName"
                        onChange={handleChange}
                        value={formData.dischargePortName}
                      />
                    </Col>
                    <Col md="6">
                      <Label>FPD</Label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        name="fpd"
                        value={formData.fpd}
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md="6">
                      <label>
                        PDA Account{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </label>
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
                    <Col md="6">
                      <Label>POL</Label>
                      <input
                        type="text"
                        className="form-control"
                        onChange={handleChange}
                        name="pol"
                        value={formData.pol}
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md="6">
                      <Label>HS Code</Label>
                      <input
                        type="text"
                        className="form-control"
                        name="hsCode"
                        onChange={handleChange}
                        value={formData.hsCode}
                      />
                    </Col>
                    <Col md="6">
                      <Label>Agreement Party</Label>
                      <input
                        type="text"
                        className="form-control"
                        name="aggrementParty"
                        onChange={handleChange}
                        value={formData.aggrementParty}
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md="6">
                      <Label>
                        VGM By Shipper{" "}
                        <span className="large mb-1 text-danger">*</span>
                      </Label>
                      <input
                        type="text"
                        className="form-control"
                        name="vgmByShipper"
                        onChange={handleChange}
                        value={formData.vgmByShipper}
                      />
                    </Col>
                    <Col md="6">
                      <Label>Vessel & Via No.</Label>
                      <input
                        type="text"
                        className="form-control"
                        name="vesselViaNumber"
                        onChange={handleChange}
                        value={formData.vesselViaNumber}
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md="6">
                      <Label>Place Of HandOver</Label>
                      <input
                        type="text"
                        className="form-control"
                        name="placeOfHandOver"
                        onChange={handleChange}
                        value={formData.placeOfHandOver}
                      />
                    </Col>
                  </Row>
                </Table>
              </div>
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

              <h6 className="mt-5">Container Condition</h6>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="containerRemarks"
                    className="form-control"
                    rows="3"
                    onChange={handleChange}
                    value={formData.containerRemarks}
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
}

export default StuffingProcessFetchDetails;
