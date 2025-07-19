import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchICDs } from "../../Redux/slices/icdsSlice";

const MeasurementDetails = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [cartingData, setCartingData] = useState({});
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [formErrors, setFormErrors] = useState({});
  const forwardersState = useSelector((state) => state.forwarders || {});
  const forwarders = forwardersState?.data || [];
  const { icds, loading } = useSelector((state) => state.icd);
  const dispatch = useDispatch();

  // Initialize formData as an empty object
  const [formData, setFormData] = useState({
    shipBillNumber: "",
    measurementNumber: "",
    measurementDate: moment().format("DD-MM-YYYY"),
    typeOfPayment: "",
    shippingLine: "",
    serviceTax: "",
    serviceTaxRate: "",
    shipperApplicant: "",
    clearingAgent: "",
    noOfPackages: "",
    packedIn: "",
    pod: "",
    fpd: "",
    cargo: "",
    hsCode: "",
    shipBillDate: "",
    icdCfs: "",
    anyOtherRemarks: "",
    locationOfCargo: "",
    paidBy: "",
    gstNumber: "",
    packageIncludedInMinimumAmount: "",
    rateForAdditionalPackage: "",
    minimumAmount: "",
    additionalAmount: "",
    totalAmount: "",
    serviceTaxAmount: "",
  });

  const [formList, setFormList] = useState([
    {
      marks: 0,
      numOfPackages: 0,
      length: 0,
      breadth: 0,
      height: 0,
      cubicMetres: 0.0,
    },
  ]);

  useEffect(() => {
    if (cartingData.data && cartingData.data.length > 0) {
      const cartingItem = cartingData.data[0]; // Get the first item from the array
      console.log("cartingItem::", cartingItem);

      setFormData((prev) => ({
        ...prev,
        // shipBillNumber: cartingItem.ship_bill_number || "",
        shippingLine: cartingItem.shipping_line_forwarder_name || "",
        shipperApplicant: cartingItem.shipper || "",
        clearingAgent: cartingItem.clearing_agent || "",
        noOfPackages: cartingItem.packages || "",
        packedIn: cartingItem.packed_in || "",
        pod: cartingItem.pod || "",
        fpd: cartingItem.fpd || "",
        cargo: cartingItem.cargo || "",
        hsCode: cartingItem.hs_code || "",
        shipBillDate: cartingItem.ship_bill_date
          ? moment(cartingItem.ship_bill_date).format("DD-MM-YYYY")
          : "",
        icdCfs: cartingItem.icd_dfs || "",
        locationOfCargo: cartingItem.location_of_cargo || "",
        // Add other fields as needed
      }));

      // Parse and populate formList from cartingDimention_data
      let dimensions = [];

      if (cartingItem.cartingDimention_data) {
        try {
          const parsed = JSON.parse(cartingItem.cartingDimention_data);
          dimensions = parsed.map((item) => ({
            marks: `01-${item.receivedCTM}` || "",
            numOfPackages: item.receivedCTM || 0,
            length: item.length || 0,
            breadth: item.breadth || 0,
            height: item.height || 0,
            cubicMetres: item.total
              ? Number(parseFloat(item.total).toFixed(3))
              : 0,
          }));
        } catch (err) {
          console.error("Invalid cartingDimention_data JSON:", err);
        }
      }

      // If cartingDimention_data is empty or invalid, fallback to marks + cbm
      if (dimensions.length === 0 && cartingItem.marks) {
        dimensions = [
          {
            marks: cartingItem.marks || "",
            numOfPackages: cartingItem.packages || 0,
            length: 0,
            breadth: 0,
            height: 0,
            cubicMetres: cartingItem.cbm ? parseFloat(cartingItem.cbm) : 0,
          },
        ];
      }

      if (dimensions.length > 0) {
        setFormList(dimensions);
      }
    }
  }, [cartingData]);

  useEffect(() => {
    dispatch(fetchForwarders());
  }, [dispatch]);

  // Function to handle input changes
  const handleInputChange = (index, field, value) => {
    const updatedForms = [...formList];

    // Safely parse value
    const parsedValue = value === "" ? 0 : parseFloat(value);

    updatedForms[index][field] = parsedValue;

    // Recalculate cubic metres when any dimension changes
    if (["length", "breadth", "height"].includes(field)) {
      const length = updatedForms[index].length || 0;
      const breadth = updatedForms[index].breadth || 0;
      const height = updatedForms[index].height || 0;

      updatedForms[index].cubicMetres = +(length * breadth * height).toFixed(3);
    }

    setFormList(updatedForms);
  };

  // Function to add a new row
  const addForm = () => {
    setFormList((prevForms) => [
      ...prevForms,
      {
        marks: "",
        numOfPackages: 0,
        length: 0,
        breadth: 0,
        height: 0,
        cubicMetres: 0,
      },
    ]);
  };

  // Function to remove a row
  const removeRow = (index) => {
    setFormList((prevForms) => prevForms.filter((_, i) => i !== index));
  };

  // Function to calculate total sum for each column
  const getTotal = (field) => {
    return formList.reduce(
      (total, item) => total + (parseFloat(item[field]) || 0),
      0
    );
  };

  const cancelForm = (index) => {
    setFormList((prevForms) => prevForms.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type == "text") {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getInputType = (field) => {
    const lowerField = field.toLowerCase();
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

  const handleSave = async () => {
    const formattedMeasurementDate = moment(
      formData.measurementDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const formattedShipBillDate = moment(
      formData.shipBillDate,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");

    const payload = {
      ship_bill_no: formData.shipBillNumber || null,
      measurement_date: formattedMeasurementDate,
      type_of_payment: formData.typeOfPayment,
      ship_line_forwarder_name: formData.shippingLine || "ABC Logistics",
      service_tax: parseFloat(formData.serviceTax) || 0,
      service_tax_rate: parseFloat(formData.serviceTaxRate) || 0,
      shipper_applicant: formData.shipperApplicant,
      clearing_agent: formData.clearingAgent,
      no_of_packages: parseInt(formData.noOfPackages) || 0,
      packed_in: formData.packedIn,
      pod: formData.pod,
      fpd: formData.fpd,
      cargo: formData.cargo,
      hs_code: formData.hsCode,
      ship_bill_date: formattedShipBillDate,
      icd_cfs: formData.icdCfs,
      any_other_remarks: formData.anyOtherRemarks,
      location_of_cargo: formData.locationOfCargo,
      paid_by: formData.paidBy,
      gstn_no: formData.gstNumber,
      packages_included_minimum_amount:
        parseInt(formData.packageIncludedInMinimumAmount) || 0,
      rate_for_additional_package:
        parseFloat(formData.rateForAdditionalPackage) || 0,
      minimum_amount: parseFloat(formData.minimumAmount) || 0,
      additional_amount: parseFloat(formData.additionalAmount) || 0,
      service_tax_amount: parseFloat(formData.serviceTaxAmount) || 0,
      total_amount: parseFloat(formData.totalAmount) || 0,
      table_rows_data: formList.map((row, index) => ({
        row_id: index + 1,
        description: row.marks,
        quantity: row.numOfPackages,
        weight: row.cubicMetres,
      })),
    };

    const response = await operationService.measurment(payload);
    if (response.success) {
      toast.success(
        `YOU HAVE SUCCESSFULLY SAVED MEASUREMENT OPERATION. WHERE ENTRY ID IS ${response.data.id}`
      );
      navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
    }
  };

  console.log("cartingArray::", cartingData);

  const handleGo = useCallback(async () => {
    const value = formData.shipBillNumber;

    if (!value || value.trim() === "") {
      toast.error("Please enter ship bill number");
      return;
    }

    const payload = {
      ["ship_bill_number"]: value.split(",").map((item) => item.trim()),
    };

    try {
      const data = await operationService.getShipBillByCartingNumber(payload);

      const cartingArray = data.data?.data || [];

      if (data.success && cartingArray.length > 0) {
        toast.success("Carting Details Fetched Successfully!");
        setCartingData({ data: cartingArray });
      } else {
        toast.error("Ship Bill Number not found");
        setCartingData({});
        setFormData((prev) => ({
          ...prev,
          shippingLine: "",
          shipperApplicant: "",
          clearingAgent: "",
          noOfPackages: "",
          packedIn: "",
          pod: "",
          fpd: "",
          cargo: "",
          hsCode: "",
          shipBillDate: "",
          icdCfs: "",
          locationOfCargo: "",
        }));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Something went wrong while fetching data");
    }
  }, [formData.shipBillNumber]);

  const handleSearch = async () => {
    console.log("hello handleSearch");
  };

  const handleDateChange = (e) => {
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
        [name]: "Date is required",
      }));
    } else if (!isValidFormat || !inputDate.isValid()) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Date must be in DD-MM-YYYY, DD/MM/YYYY or DD.MM.YYYY format",
      }));
    } else if (name === "measurementDate") {
      // Only apply before/after validation for allotmentDate
      if (inputDate.isAfter(current)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be in the future",
        }));
      } else if (inputDate.isBefore(minimum)) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "Date cannot be more than 3 days in the past",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else {
      // For other dates (like shipBillDate), just clear the error if format is valid
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Measurement" parent="Apps" title="Measurement" />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Ship Bill Number</label>
                  <input
                    name="shipBillNumber"
                    type="text"
                    className="form-control"
                    placeholder="Ship Bill Number"
                    onChange={handleChange}
                    value={formData.shipBillNumber}
                  />
                </Col>
                <Col md="3" className="mt-4">
                  <button className="btn btn-primary" onClick={handleGo}>
                    Go
                  </button>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Measurement Date</label>
                  <input
                    name="measurementDate"
                    type="text"
                    className={`form-control ${
                      formErrors.measurementDate ? "is-invalid" : ""
                    }`}
                    placeholder="DD-MM-YYYY"
                    onChange={handleDateChange}
                    value={formData.measurementDate}
                    max={currentDate}
                    min={minAllowedDate}
                  />
                  {formErrors.measurementDate && (
                    <div className="invalid-feedback">
                      {formErrors.measurementDate}
                    </div>
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Type Of Payment</label>
                  {/* <input
                    name="typeOfPayment"
                    type="text"
                    className="form-control"
                    placeholder="Payment Type"
                    onChange={handleChange}
                    value={formData.typeOfPayment}
                  /> */}
                  <select
                    name="typeOfPayment"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.typeOfPayment}
                  >
                    <option value="">Select Type Of Payment</option>
                    <option value="cash">Cash</option>
                    <option value="billing">Billing</option>
                    <option value="upi">UPI</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">Shipping Line</label>
                  <select
                    name="shippingLine"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.shippingLine}
                  >
                    <option value="">Shipping Line Code Name</option>
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
                  <label htmlFor="">GST</label>
                  {/* <input
                    name="serviceTax"
                    type="text"
                    className="form-control"
                    placeholder="Service Tax"
                    onChange={handleChange}
                    value={formData.serviceTax}
                  /> */}
                  <select
                    name="serviceTax"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.serviceTax}
                  >
                    <option value="">Select GST</option>
                    <option value="applicable">APPLICABLE</option>
                    <option value="not-applicable">NOT APPLICABLE</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">GST Rate</label>
                  <input
                    name="serviceTaxRate"
                    type="text"
                    className="form-control"
                    placeholder="Service Tax Rate"
                    onChange={handleChange}
                    value={formData.serviceTaxRate}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Shipper Applicant</label>
                  <input
                    name="shipperApplicant"
                    type="text"
                    className="form-control"
                    placeholder="shipper/Applicant"
                    onChange={handleChange}
                    value={formData.shipperApplicant}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Clearing Agent</label>
                  <input
                    name="clearingAgent"
                    type="text"
                    className="form-control"
                    placeholder="Clearing Agent"
                    onChange={handleChange}
                    value={formData.clearingAgent}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Number Of Packages</label>
                  <input
                    name="noOfPackages"
                    type="text"
                    className="form-control"
                    placeholder="No. Of Packages"
                    onChange={handleChange}
                    value={formData.noOfPackages}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Packed In</label>
                  <input
                    name="packedIn"
                    type="text"
                    className="form-control"
                    placeholder="Packed In"
                    onChange={handleChange}
                    value={formData.packedIn}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">POD</label>
                  <input
                    name="pod"
                    type="text"
                    className="form-control"
                    placeholder="POD"
                    onChange={handleChange}
                    value={formData.pod}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">FPD</label>
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
                  <label htmlFor="">Cargo</label>
                  <input
                    name="cargo"
                    type="text"
                    className="form-control"
                    placeholder="Cargo"
                    onChange={handleChange}
                    value={formData.cargo}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">HS Code</label>
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
                  <label htmlFor="">Ship Bill Date</label>
                  <input
                    name="shipBillDate"
                    type="text"
                    className="form-control"
                    placeholder="ShipBill Date"
                    onChange={handleChange}
                    value={formData.shipBillDate}
                  />
                </Col>
                <Col md="6">
                  <label>ICD/CFS</label>
                  <select
                    name="icdDfs"
                    onChange={handleChange}
                    value={formData.icdCfs}
                    className={`form-control`}
                  >
                    <option value="">Select ICD</option>
                    {icds.map((icd) => (
                      <option key={icd.id} value={icd.id}>
                        {icd.code} - {icd.name}
                      </option>
                    ))}
                  </select>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Any Other Remarks</label>
                  <input
                    name="anyOtherRemarks"
                    type="text"
                    className="form-control"
                    placeholder="Any Other Remarks"
                    onChange={handleChange}
                    value={formData.anyOtherRemarks}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Location of Cargo</label>
                  <input
                    name="locationOfCargo"
                    type="text"
                    className="form-control"
                    placeholder="Location Of Cargo"
                    onChange={handleChange}
                    value={formData.locationOfCargo}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Paid By</label>
                  {/* <input
                    name="paidBy"
                    type="text"
                    className="form-control"
                    placeholder="Paid By"
                    onChange={handleChange}
                    value={formData.paidBy}
                  /> */}
                  <select
                    name="paidBy"
                    className="form-select"
                    onChange={handleChange}
                    value={formData.paidBy}
                  >
                    <option value="">Select Paid By</option>
                    <option value="clearing-agent">Clearing Agent</option>
                    <option value="forwarder">Forwarder</option>
                    <option value="shipper">Shipper</option>
                  </select>
                </Col>
                <Col md="6">
                  <label htmlFor="">GST Number</label>
                  <input
                    name="gstNumber"
                    type="text"
                    className="form-control"
                    placeholder="GST Number"
                    onChange={handleChange}
                    value={formData.gstNumber}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Package Included Min Amount</label>
                  <input
                    name="packageIncludedInMinimumAmount"
                    type="text"
                    className="form-control"
                    placeholder="Package Included in Min. Amount"
                    onChange={handleChange}
                    value={formData.packageIncludedInMinimumAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Rate for Additional Packages</label>
                  <input
                    name="rateForAdditionalPackage"
                    type="text"
                    className="form-control"
                    placeholder="Rate For Additional Package"
                    onChange={handleChange}
                    value={formData.rateForAdditionalPackage}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Minimum Amount</label>
                  <input
                    name="minimumAmount"
                    type="text"
                    className="form-control"
                    placeholder="Minimum Amount"
                    onChange={handleChange}
                    value={formData.minimumAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Additional Amount</label>
                  <input
                    name="additionalAmount"
                    type="text"
                    className="form-control"
                    placeholder="Additional Amount"
                    onChange={handleChange}
                    value={formData.additionalAmount}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md="6">
                  <label htmlFor="">Service Tax Amount</label>
                  <input
                    name="serviceTaxAmount"
                    type="text"
                    className="form-control"
                    placeholder="Service Tax Amount"
                    onChange={handleChange}
                    value={formData.serviceTaxAmount}
                  />
                </Col>
                <Col md="6">
                  <label htmlFor="">Total Amount</label>
                  <input
                    name="totalAmount"
                    type="text"
                    className="form-control"
                    placeholder="Total Amount"
                    onChange={handleChange}
                    value={formData.totalAmount}
                  />
                </Col>
              </Row>
            </div>
            <div className="container mt-4">
              <table className="table table-bordered">
                <thead className="bg-dark text-light">
                  <tr>
                    <th>Row Number</th>
                    <th>Marks</th>
                    <th>No. of Packages</th>
                    <th>Length</th>
                    <th>Breadth</th>
                    <th>Height</th>
                    <th>Cubic Metres</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formList.map((form, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={form.marks}
                          onChange={(e) =>
                            handleInputChange(index, "marks", e.target.value)
                          }
                        />
                      </td>
                      {[
                        "numOfPackages",
                        "length",
                        "breadth",
                        "height",
                        "cubicMetres",
                      ].map((field) => (
                        <td key={field}>
                          <input
                            type="number"
                            className="form-control"
                            value={
                              field === "cubicMetres"
                                ? parseFloat(form[field] || 0).toFixed(3) // ✅ Force 3 decimal places
                                : form[field]
                            }
                            onChange={(e) =>
                              handleInputChange(index, field, e.target.value)
                            }
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          onClick={() => removeRow(index)}
                          className="btn btn-danger"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Row for Total Sum */}
                  <tr className="bg-light font-weight-bold">
                    <td colSpan={2} className="text-center">
                      Total
                    </td>
                    <td>{getTotal("numOfPackages")}</td>
                    <td>{getTotal("length")}</td>
                    <td>{getTotal("breadth")}</td>
                    <td>{getTotal("height")}</td>
                    <td>{getTotal("cubicMetres").toFixed(3)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <button onClick={addForm} className="btn btn-primary mt-3">
                ➕ Add Row
              </button>

              <div className="mt-3 text-center">
                <button className="btn btn-success">SAVE</button>
              </div>

              <div className="mt-2 text-center">
                <a href="#" className="text-primary">
                  Search for Records
                </a>
              </div>
            </div>
            <div className="mt-2 text-center">
              <a href="#" className="text-primary">
                Search for Records
              </a>
            </div>
            <div className="text-center">
              <button className="btn btn-primary w-100" onClick={handleSave}>
                Save
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default MeasurementDetails;
