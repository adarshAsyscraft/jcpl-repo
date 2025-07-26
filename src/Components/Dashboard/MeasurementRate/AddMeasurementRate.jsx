import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchForwarders } from "../../../Redux/slices/forwarderSlice";
import { Select, Form } from "antd";
import MeasurementRateAPIs from "../../../Services/measurementRateAPIs";
import { toast } from "react-toastify";
import ForwarderSelector from "./ForwarderSelector";
import { useNavigate } from "react-router";

const AddMeasurementRate = () => {
  const dispatch = useDispatch();
  const forwardersState = useSelector((state) => state.forwarders || {});
  const forwarders = forwardersState?.data || [];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    selectedForwarders: [],
    rateType: "",
    packagesInMinAmt: "",
    rateForAdditionalPkg: "",
    minimumAmount: "",
    gstnRate: "",
  });

  useEffect(() => {
    dispatch(fetchForwarders());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForwardersChange = (values) => {
    setFormData((prev) => ({ ...prev, selectedForwarders: values }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        shiplineForwarders: formData.selectedForwarders,
        typeOfRate: formData.rateType,
        packagesMinAmount: formData.packagesInMinAmt,
        additionalPackagesRate: formData.rateForAdditionalPkg, // ✅ fixed key
        minAmount: formData.minimumAmount,
        gstRate: formData.gstnRate,
      };

      const result = await MeasurementRateAPIs.create(payload);
      if (result.success) {
        toast.success("Measurement Rate Saved Successfully");
        navigate(`/dashboard/measurement-rate/Admin`);
      } else {
        toast.error("Failed to save: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      toast.error("Unable to Save Measurement Rate!");
      console.error("API Error:", error);
    }
  };

  return (
    <Container fluid className="container-wrap">
      <Row>
        <Col sm="12">
          <div className="card shadow p-4">
            <h5 className="mb-3">Measurement Rate Setup</h5>

            <div className="mb-3">
              <label>Shipping Lines</label>
              <ForwarderSelector
                forwarders={forwarders}
                selectedLines={formData.selectedForwarders}
                setSelectedLines={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedForwarders: value,
                  }))
                }
              />
            </div>

            <Row className="mb-3">
              <Col md="6">
                <label>Type of Rate</label>
                <select
                  name="rateType"
                  className="form-select"
                  value={formData.rateType}
                  onChange={handleChange}
                >
                  <option value="">Select Type</option>
                  <option value="Import">Import</option>
                  <option value="Export">Export</option>
                </select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md="6">
                <label>Packages Included in Minimum Amount</label>
                <input
                  name="packagesInMinAmt"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 10"
                  value={formData.packagesInMinAmt}
                  onChange={handleChange}
                />
              </Col>
              <Col md="6">
                <label>Rate for Additional Package</label>
                <input
                  name="rateForAdditionalPkg"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={formData.rateForAdditionalPkg}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md="6">
                <label>Minimum Amount</label>
                <input
                  name="minimumAmount"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 1000"
                  value={formData.minimumAmount}
                  onChange={handleChange}
                />
              </Col>
              <Col md="6">
                <label>GSTN Rate</label>
                <input
                  name="gstnRate"
                  type="number"
                  className="form-control"
                  placeholder="e.g. 18"
                  value={formData.gstnRate}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <div className="text-center mt-4">
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddMeasurementRate;
