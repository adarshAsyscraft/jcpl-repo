import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row, Table } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import ContainerDetailsSection from "./containerDetails";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";
import moment from "moment";
import EditCartingModal from "./EditStuffingLCL";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { get } from "react-hook-form";
import StuffingProcessFetchDetails from "./StuffingProcessFetchDetails";
import _, { update } from "lodash";

const StuffingLCL = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [previousPageData, setPreviousPageData] = useState({});
  const containerNumber = location.state?.containerNumber || "";
  const selectedOperation = location.state?.operation || "";
  const [dataByCartingNumber, setDataByCartingNumber] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [stuffingDetail, setStuffingDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operationId, setOperationId] = useState(null);

  const [cartingData, setCartingData] = useState({});
  const [errors, setErrors] = useState({});
  const { data: forwarders = [], loading: forwardersLoading } = useSelector(
    (state) => state.forwarders || {}
  );
  const { fetchedContainer } = useSelector((state) => state.container);
  const [isCarting, setIsCarting] = useState(false);
  const [isShip, setIsShip] = useState(false);
  const currentDate = moment().format("DD-MM-YYYY");
  const minAllowedDate = moment().subtract(3, "days").format("DD-MM-YYYY");
  const [jsonData, setJsonData] = useState([]);

  const [formData, setFormData] = useState({
    containerNumber: fetchedContainer?.container_number || "",
    shippingLineId: fetchedContainer?.shipping_line_id || "",
    size: fetchedContainer?.size || "",
    type: fetchedContainer?.container_type || "",
    tareWeight: fetchedContainer?.tare_weight || "",
    mgWeight: fetchedContainer?.mg_weight || "",
    mfdDate: fetchedContainer?.mfd_date || "",
    cscValidity: fetchedContainer?.csc_validity || "",
    operation: selectedOperation,
    pol: "",
    shippingLineSeal: "",
    remarks: fetchedContainer?.remarks || "",
    fpd: "",
    stuffingRequestDate: "",
    pod: "",
    customSeal: "",
    shipBillNumber: "",
    shipLineSeal: "",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (e.target.type == "text") {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "cartingIdsCsv" && value) {
      setIsCarting(true);
      setIsShip(false);
    } else if (name === "shipBillNumber" && value) {
      setIsShip(true);
      setIsCarting(false);
    }
  };

  useEffect(() => {
    const updatedData = { ...formData };

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

    setFormData(updatedData);
    console.log("Container ID::", fetchedContainer.id);
  }, [fetchedContainer]);

  const handleDownload = () => {
    // 1. Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const fileName = "Gautam";

    // 2. Create a new workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 3. Write workbook to binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // 4. Create a blob and trigger download
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${fileName}.xlsx`);
  };

  const getOperationId = async () => {
    try {
      const res = await operationService.getByContainerNumber(
        fetchedContainer?.container_number
      );
      setOperationId(res.data[0].id);
      console.log("Result::", res.data[0].id);
    } catch (error) {
      console.log("Error::", error);
    }
  };

  useEffect(() => {
    getOperationId();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        container_id: fetchedContainer.id,
        stuffing_request_date: formData.stuffingRequestDate
          ? moment(formData.stuffingRequestDate, "DD-MM-YYYY").format(
              "YYYY-MM-DD"
            )
          : null,
        pod: formData.pod || null,
        fpd: formData.fpd || null,
        pol: formData.pol || null,
        shipping_line_seal: formData.shipLineSeal || null,
        custom_seal: formData.customSeal || null,
        carting_ids: "ID1,ID2,ID3", // static
        ship_bill_no: formData.shipBillNumber || null,
        select_master_line: 3,
      };

      let existing = null;
      try {
        const res = await operationService.getStuffingLclDetails(
          fetchedContainer?.container_number
        );
        existing = Array.isArray(res?.data) ? res.data[0] : res.data;

        console.log("Fetched existing stuffing LCL:", existing);
      } catch (err) {
        console.warn("No existing stuffing LCL found:", err);
      }

      if (existing) {
        // Normalize dates
        if (existing.stuffing_request_date) {
          existing.stuffing_request_date = moment(
            existing.stuffing_request_date
          ).format("YYYY-MM-DD");
        }

        const normalize = (value) => {
          if (value === undefined || value === null) return "";
          return typeof value === "string" ? value.trim() : String(value);
        };

        const isChanged = Object.entries(payload).some(([key, value]) => {
          const newVal = normalize(value);
          const existingVal = normalize(existing[key]); // same key names!
          return newVal !== existingVal;
        });

        if (!isChanged) {
          toast.info("No changes detected to update.");
          return setLoading(false);
        }

        const updated = await operationService.updateStuffingLcl(
          operationId,
          payload
        );
        console.log("Response::", updated);
        if (updated?.success) {
          toast.success("Fields are Updated Successfully");
        }
      } else {
        const create = await operationService.stuffingLCL(payload);
        if (create?.success) {
          toast.success(
            `YOU HAVE SUCCESSFULLY SAVED STUFFING-LCL DETAIL FOR ${fetchedContainer?.container_number}. WHERE ENTRY ID IS ${create.data.id}`
          );
          localStorage.setItem("operation", 9);
        } else {
          console.error("Create failed:", create);
          toast.error("Failed to save new stuffing details.");
        }
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerByNumber(containerNumber));
  }, [dispatch, containerNumber]);

  const handleProceed = async () => {
    setStuffingDetail(true);
  };

  // Option 1: Move the function inside useEffect (simplest solution)

  const getPreviousPageData = async () => {
    let lastOp = localStorage.getItem("operation");

    try {
      let res;
      if (lastOp == "19") {
        res = await operationService.allotmentStuffingDetailsByContainerNo(
          fetchedContainer.container_number
        );
        if (res.success) setPreviousPageData(res.data);
      } else if (lastOp == "9") {
        res = await operationService.getStuffingLclDetails(
          fetchedContainer.container_number
        );
        console.log("Response::", res);
        if (res.success && res.data.length > 0)
          setPreviousPageData(res.data[0]);
      }
    } catch (error) {
      console.error("getPreviousPageData error::", error);
    }
  };

  useEffect(() => {
    getPreviousPageData();
  }, [fetchedContainer.container_number]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      stuffingRequestDate:
        moment(previousPageData.stuffing_request_date).format("DD-MM-YYYY") ||
        null,
      pol: previousPageData.pol || null,
      pod: previousPageData.pod || previousPageData.discharge_port_name || null,
      fpd: previousPageData.fpd || null,
      shipLineSeal:
        previousPageData.shipping_line_seal ||
        previousPageData.ship_line ||
        null,
      customSeal:
        previousPageData.custom_seal || previousPageData.custom || null,
    }));
  }, [previousPageData]);

  useEffect(() => {
    if (formData.containerNumber) {
      fetchCartingDetails();
    }
  }, [fetchedContainer?.container_number]);

  // 🔁 Reusable GET call
  const fetchCartingDetails = async () => {
    try {
      const queryParams = {
        containerNumber: formData.containerNumber,
      };

      const res = await operationService.getCartingDetails(queryParams);
      if (res.success) {
        setDataByCartingNumber(res.data);
      } else {
        toast.error(res.message || "Failed to fetch carting details");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Something went wrong while fetching details.");
    }
  };

  const handleSearch = async () => {
    const isValid = isCarting || isShip;
    if (!isValid) {
      toast.error("Please select either Carting or Ship Bill option.");
      return;
    }

    const cartingVal = formData.cartingIdsCsv || "";
    const shipVal = formData.shipBillNumber || "";

    if (isCarting && !cartingVal.trim()) {
      toast.error("Carting Number cannot be empty.");
      return;
    }

    if (isShip && !shipVal.trim()) {
      toast.error("Ship Bill Number cannot be empty.");
      return;
    }

    let payload = { containerNumber: formData.containerNumber };

    if (isCarting) {
      payload.cartingNumber = cartingVal.split(",").map((item) => item.trim());
    }
    if (isShip) {
      payload.shippBillNumber = shipVal.split(",").map((item) => item.trim());
    }

    try {
      const result = await operationService.addCartingDetails(payload);

      if (result.success) {
        if (result.inserted.length > 0) {
          toast.success(`Inserted: ${result.inserted.join(", ")}`);
        } else if (result.alreadyExists.length > 0) {
          toast.error(`Already exists: ${result.alreadyExists.join(", ")}`);
        } else if (result.notFound.length > 0) {
          toast.error(`Not found: ${result.notFound.join(", ")}`);
        }

        await fetchCartingDetails(); // fetch after insert
      } else {
        toast.error(result.message || "Failed to insert.");
      }
    } catch (err) {
      console.error("Insert Error:", err);
      toast.error("Something went wrong.");
    }
  };

  const handleDelete = async (item) => {
    try {
      const res = await operationService.deleteCartingDetails(item.id);
      if (res.success) {
        toast.success("Data deleted successfully");
        await fetchCartingDetails(); // fetch after delete
      } else {
        toast.error("Delete failed.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong during delete.");
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({ ...item });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (updatedFields) => {
    const changedFields = {};

    // Merge selectedItem and updatedFields to avoid missing keys
    const mergedFields = { ...selectedItem, ...updatedFields };

    Object.keys(mergedFields).forEach((key) => {
      const newValue = mergedFields[key];
      const oldValue = selectedItem[key];

      // Special handling for ship_bill_date
      if (key === "ship_bill_date") {
        const formattedOld = oldValue
          ? moment(oldValue).format("DD-MM-YYYY")
          : "";
        const formattedNew = newValue
          ? moment(newValue).format("DD-MM-YYYY")
          : "";

        if (formattedOld !== formattedNew) {
          changedFields[key] = moment(newValue, [
            "DD-MM-YYYY",
            "YYYY-MM-DD",
          ]).format("YYYY-MM-DD");
        }
      } else if (newValue !== oldValue) {
        changedFields[key] = newValue;
      }
    });

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      const res = await operationService.updateCarting(
        selectedItem.id,
        changedFields
      );

      if (res.success) {
        const updatedList = dataByCartingNumber.map((item) =>
          item.id === selectedItem.id ? { ...item, ...changedFields } : item
        );
        setDataByCartingNumber(updatedList);
        toast.success("Carting data updated successfully");
        setEditModal(false);
      } else {
        toast.error(res.message || "Failed to update carting data");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Something went wrong while updating");
    }
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

  return (
    <Fragment>
      {!stuffingDetail ? (
        <>
          <Breadcrumbs
            mainTitle="Stuffing Plan of Container LCL"
            parent="Apps"
            title="Stuffing Plan of Container LCL"
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

                  <div className="shadow-sm p-4 rounded mt-4">
                    {/* <h6 className="mb-3 mt-4">Stuffing Request Date</h6> */}
                    <Row className="mb-3 mt-5">
                      <Col md="6">
                        <label>Stuffing Request Date</label>
                        <input
                          name="stuffingRequestDate"
                          type="text"
                          placeholder="DD-MM-YYYY"
                          className={`form-control ${
                            errors.stuffingRequestDate ? "is-invalid" : ""
                          }`}
                          onChange={handleDateChange}
                          value={formData.stuffingRequestDate}
                        />
                        {errors?.stuffingRequestDate && (
                          <div className="invalid-feedback">
                            {errors.stuffingRequestDate}
                          </div>
                        )}
                      </Col>
                      <Col md="6">
                        <label>POD</label>
                        <input
                          type="text"
                          name="pod"
                          className="form-control"
                          placeholder="POD"
                          onChange={handleChange}
                          value={formData.pod}
                        />
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md="6">
                        <label>FPD</label>
                        <input
                          type="text"
                          name="fpd"
                          className="form-control"
                          placeholder="FPD"
                          onChange={handleChange}
                          value={formData.fpd}
                        />
                      </Col>
                      <Col md="6">
                        <label>POL</label>
                        <input
                          type="text"
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
                        <label>Shipping Line Seal</label>
                        <input
                          type="text"
                          name="shipLineSeal"
                          className="form-control"
                          placeholder="ShipLine Seal"
                          onChange={handleChange}
                          value={formData.shipLineSeal}
                        />
                      </Col>
                      <Col md="6">
                        <label>Custom Seal</label>
                        <input
                          type="text"
                          name="customSeal"
                          className="form-control"
                          placeholder="Custom Seal"
                          onChange={handleChange}
                          value={formData.customSeal}
                        />
                      </Col>
                    </Row>
                  </div>

                  <h5 className="mb-3 mt-4">Unstuffed Cartings</h5>
                  <Row className="mb-3">
                    <Col md="6">
                      <input
                        type="text"
                        name="cartingIdsCsv"
                        className="form-control"
                        placeholder="Carting IDS CSV"
                        onChange={handleChange}
                        value={formData.cartingIdsCsv}
                      />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <input
                        type="text"
                        name="shipBillNumber"
                        className="form-control"
                        placeholder="Ship Bill Number"
                        onChange={handleChange}
                        value={formData.shipBillNumber}
                      />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <button
                        className="btn btn-primary"
                        onClick={handleSearch}
                      >
                        Go
                      </button>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md="6">
                      <h6 className="mt-5">Carting Details</h6>
                    </Col>
                  </Row>
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
                          <th style={{ width: "100px" }}>Actions</th>
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
                                  {forwarders.find(
                                    (res) =>
                                      res.id ==
                                      item.shipping_line_forwarder_name
                                  )?.code || "-"}
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
                                <td>
                                  <div className="d-flex justify-content-center gap-2">
                                    <button
                                      className="btn btn-2xl"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <i className="fa fa-edit text-success fa-2xl"></i>
                                    </button>
                                    <button
                                      className="btn btn-2xl"
                                      onClick={() => handleDelete(item)}
                                    >
                                      <i className="fa fa-trash text-danger"></i>
                                    </button>
                                  </div>
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
                                      sum +
                                      (parseFloat(item.cargo_weight) || 0),
                                    0
                                  )
                                  .toFixed(2)}{" "}
                              </td>
                              <td></td>
                              <td>
                                {dataByCartingNumber.reduce(
                                  (sum, item) =>
                                    sum + (parseFloat(item.packages) || 0),
                                  0
                                )}
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

                  <div className="text-center">
                    <Row className="mb-3">
                      <button
                        className="btn btn-primary w-100"
                        onClick={handleSave}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </Row>
                  </div>
                  <Row className="mb-3">
                    <Col xs="12" md="6" className="mb-2 mb-md-0">
                      <button
                        onClick={handleDownload}
                        className="btn btn-primary w-100"
                      >
                        Download Stuffing Request Details
                      </button>
                    </Col>
                    <Col xs="12" md="6">
                      <button
                        onClick={handleProceed}
                        className="btn btn-primary w-100"
                      >
                        Proceed to enter Stuffing Details
                      </button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Container>

          <EditCartingModal
            open={editModal}
            onClose={() => setEditModal(false)}
            formData={editFormData}
            onChange={handleEditChange}
            onSave={handleUpdate}
          />
        </>
      ) : (
        <StuffingProcessFetchDetails
          fetchedContainer={fetchedContainer}
          forwarders={forwarders}
          forwardersLoading={forwardersLoading}
        />
      )}
    </Fragment>
  );
};

export default StuffingLCL;
