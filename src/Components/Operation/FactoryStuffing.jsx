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

  // Fetch data on component mount
  useEffect(() => {
    const containerNumber = location.state?.containerNumber || "";
    if (containerNumber) {
      dispatch(fetchContainerByNumber(containerNumber));
    }
    dispatch(fetchForwarders());
    dispatch(fetchYards());
  }, [dispatch, location.state]);

  // Update form data when container data is available
  useEffect(() => {
    if (location.state || fetchedContainer?.container_number) {
      const source = fetchedContainer;
      setFormData((prev) => ({
        ...prev,
        containerNumber:
          source.container_number || source.containerNumber || "",
        shippingLineId: source.shipping_line_id || source.shippingLineId || "",
        size: source.size || "",
        type: source.container_type || source.type || "",
        tareWeight: source.tare_weight || source.tareWeight || "",
        mgWeight: source.mg_weight || source.mgWeight || "",
        mfdDate: source.mfd_date || source.mfdDate || "",
        cscValidity: source.csc_validity || source.cscValidity || "",
        remarks: source.remarks || "",
        operation: source.operation || "",
      }));
    }
  }, [location.state, fetchedContainer]);

  // Recalculate totals when cargo details change
  useEffect(() => {
    calculateTotals();
  }, [cargoDetails, calculateTotals]);

  // Form handlers
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "vgmByShipper") {
      const updatedVgmByShipper =
        name === "vgmByShipper"
          ? parseFloat(value)
          : parseFloat(formData.vgmByShipper || 0);

      // Check VGM difference logic
      const difference = Number(vgm - updatedVgmByShipper);
      setVgmDiff(difference);
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

  const handleDetailChange = (index, field, value, isContainer = false) => {
    const setter = isContainer ? setContainerDetails : setCargoDetails;
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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

  const getPreviousData = async () => {
    const containerNumber = fetchedContainer?.container_number;
    if (!containerNumber) return;
    let allotmentRes;
    let gateInRes;

    try {
      let lastOp = localStorage.getItem("operation");
      // 1. First fetch allotment data (for cargo details)
      if (lastOp == "19") {
        allotmentRes =
          await operationService.allotmentStuffingDetailsByContainerNo(
            containerNumber
          );
        if (!allotmentRes.success) {
          toast.error("Failed to fetch allotment stuffing data");
          return;
        }
        setAllotmentData(allotmentRes);
        console.log("AllotmentRes::", allotmentRes);
      }

      // 2. Then fetch gate-in data (for seal details and other fields)
      else if (lastOp == "10") {
        gateInRes = await operationService.getInDataFechByContainerNumber(
          containerNumber
        );
        if (!gateInRes.success) {
          toast.error("Failed to fetch gate-in data");
          return;
        }
        setPreviousPageData(gateInRes.data);
      }
      // 3. Set cargo details from allotment data
      const cargoDetail = {
        shipBillNumber: allotmentData.data.shipp_bill_no || "",
        shipBillDate:
          moment(allotmentData.data.s_bill_date).format("DD-MM-YYYY") || "",
        shipperName: allotmentData.data.shipper || "",
        consigneeName: allotmentData.data.consignee_name || "",
        cargo: allotmentData.data.cargo || "",
        "cargoWeight (in kg)": allotmentData.data.cargo_wt_kgs || "0.000",
        cbm: allotmentData.data.cbm || "0.000",
        packedIn: allotmentData.data.packed_in || "",
        packages: allotmentData.data.packages || "0",
        marks: allotmentData.data.marks || "",
        number: allotmentData.data.number || "",
        remarks: allotmentData.data.remark || "",
        id: Date.now(),
        slNo: 1,
      };
      setCargoDetails([cargoDetail]);

      // 4. Set form data combining sources
      setFormData((prev) => ({
        ...prev,
        // From allotment data

        cargoCategory: allotmentData.data.cargo_category,
        imoNumber: allotmentData.data.imo_number,
        unNumber: allotmentData.data.un_number,
        temperature: allotmentData.data.temperature,
        bookingNumber: allotmentData.data.booking_no,
        pol: allotmentData.data.pol,
        dischargePortName: allotmentData.data.discharge_port_name,
        fpd: allotmentData.data.fpd,
        pdaAccount: allotmentData.data.pda_account,
        aggrementParty: allotmentData.data.agreement_party,
        vesselViaNumber: allotmentData.data.vessel_via_no,
        placeOfHandOver: allotmentData.data.place_of_handover,

        excise: previousPageData.data.excise,
        other: previousPageData.data.other,
        otherSealRemarks:
          previousPageData.data.other_seal_desc ||
          previousPageData.data.otherSealDescription,

        // From gate-in data (seal details)
        forwarder1: previousPageData.data.forwarder1Id,
        forwarder2: previousPageData.data.forwarder2Id,
        stuffingDate: moment(previousPageData.data?.inDate).format(
          "DD-MM-YYYY"
        ),
        shipline:
          previousPageData.data.ship_line || previousPageData.data.shipLine,
        yardName: previousPageData.data.yard_id || previousPageData.data.yard,
        custom: previousPageData.data.custom,
      }));
    } catch (error) {
      console.error("Error fetching previous data:", error);
      toast.error("Failed to fetch previous operation data");
    }
  };

  useEffect(() => {
    getPreviousData();
  }, []);

  const handleSubmit = async () => {
    try {
      const newErrors = {};

      // if (vgmDiff >= -1000 && vgmDiff <= 1000) {
      //   toast.success("Shi Hai");
      // } else {
      //   toast.error("Please Check VGM weight");
      // }

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
          `VGM difference is ${vgmDifference.toFixed(
            2
          )} kgs (Calculated VGM: ${calculatedVgm.toFixed(
            2
          )} kgs, Shipper VGM: ${vgmByShipper.toFixed(
            2
          )} kgs). Do you want to proceed with this entry?`
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
                  <label>Stuffing Date</label>
                  <input
                    name="stuffingDate"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.stuffingDate}
                  />
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
                  <label>Cargo Category</label>
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
                    <label>IMO Number</label>
                    <input
                      name="imoNumber"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.imoNumber}
                    />
                  </Col>
                  <Col md="6">
                    <label>UN Number</label>
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
                    <label>Temperature</label>
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
                  <label>Yard Name</label>
                  <select
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
                    <option value="linear pda">Linear PDA</option>
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
                  <label>VGM By Shipper</label>
                  <input
                    name="vgmByShipper"
                    type="text"
                    className="form-control"
                    onChange={handleChange}
                    value={formData.vgmByShipper}
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

              <div className="mb-3">
                <button
                  className="btn btn-primary w-25"
                  onClick={() => addDetailForm(false)}
                >
                  Proceed to enter Cargo Detail
                </button>

                {cargoDetails.map((form, index) => (
                  <div key={form.id} className="mt-4 p-4 border rounded">
                    <h3 className="font-semibold mb-2">
                      Cargo Detail - SL No: {form.slNo}
                    </h3>
                    <Row>
                      {Object.entries(form).map(
                        ([field, value]) =>
                          !["slNo", "id"].includes(field) && (
                            <Col md="4" key={field} className="mb-2">
                              <label className="form-label">{field}</label>
                              <input
                                type={getInputType(field)}
                                value={value}
                                onChange={(e) =>
                                  handleDetailChange(
                                    index,
                                    field,
                                    e.target.value
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
