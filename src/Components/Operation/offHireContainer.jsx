import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpectedContainer } from "../../Redux/slices/expectedArrivalSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";

const OffHire = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedOperation = location.state?.operation || "1";
  const {
    fetchedContainer,
    loading: containerLoading,
    error: containerError,
  } = useSelector((state) => state.container);

  // Fetch container details when containerNumber changes
  useEffect(() => {
    if (containerNumber) {
      dispatch(fetchContainerByNumber(containerNumber));
    }
  }, [containerNumber, dispatch]);

  // Fetch other dropdown data (forwarders, yards, containerTypes)
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
    yards = [],
    loading: yardsLoading,
    error: yardsError,
  } = useSelector((state) => state.yards || {});

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
    offHireDate: "", // Added for off-hire date
  });

  // Update formData when container details are fetched
  useEffect(() => {
    if (fetchedContainer) {
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
    }
  }, [fetchedContainer, selectedOperation]);

  // If location.state is available, directly set form data
  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        containerNumber: location.state.containerNumber || "",
        shippingLineId: location.state.shippingLineId || "",
        size: location.state.size || "",
        type: location.state.type || "",
        tareWeight: location.state.tareWeight || "",
        mgWeight: location.state.mgWeight || "",
        mfdDate: location.state.mfdDate || "",
        cscValidity: location.state.cscValidity || "",
        remarks: location.state.remarks || "",
        operation: location.state.operation || selectedOperation || "",
      }));
    }
  }, [location.state, selectedOperation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      shippingLineId: parseInt(formData.shippingLineId), // In case it's passed as string
      mgWeight: parseInt(formData.mgWeight),
      tareWeight: parseInt(formData.tareWeight),
    };

    try {
      const response = await dispatch(
        createExpectedContainer(payload)
      ).unwrap();
      if (
        response?.data?.message === "Expected container created successfully"
      ) {
        toast.success(
          `YOU HAVE SUCCESSFULLY SAVED OFFHIRE OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error("Error while creating container:", error);
      toast.error("Failed to create container!");
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Off Hire of Container"
        parent="Apps"
        title="Off Hire of Container"
      />
      <Container fluid={true} className="container-wrap">
        <Row>
          <Col sm="12">
            <div className="card shadow p-4">
              {/* Container Details Section */}
              <div className="shadow-sm p-4 mt-4">
                <ContainerDetailsSection
                  formData={formData}
                  handleChange={handleChange}
                  forwarders={forwarders}
                  forwardersLoading={forwardersLoading}
                  fetchedContainer={fetchedContainer}
                  disabled={true}
                />
              </div>

              {/* Off Hire Details Section */}
              <div className="shadow-sm p-4 mt-4">
                <h5 className="mb-3 mt-5">Off Hire Details</h5>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Hired Date</label>
                    <input
                      name="offHireDate"
                      type="month"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.offHireDate}
                    />
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Hired From</label>
                    <select
                      name="forwarder1"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.forwarder1}
                    >
                      <option value="">Forwarder1 Code Name</option>
                      {forwarders &&
                        forwarders.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        ))}
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="6">
                    <label>Hired To</label>
                    <select
                      name="forwarder2"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.forwarder2}
                    >
                      <option value="">Forwarder2 Code Name</option>
                      {forwarders &&
                        forwarders.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.name}
                          </option>
                        ))}
                    </select>
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

export default OffHire;
