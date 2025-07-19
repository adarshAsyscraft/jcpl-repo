import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Label, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createExpectedContainer } from "../../Redux/slices/expectedArrivalSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import ContainerDetailsSection from "./containerDetails";
import { fetchICDs } from "../../Redux/slices/icdsSlice";

const OnHire = () => {
  const { containerNumber } = useParams();
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const containerData = location.state || "";

  const selectedOperation = location.state?.operation || "1";

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
  }, []);

  useEffect(() => {
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchICDs());
  }, [dispatch]);

  const { fetchedContainer } = useSelector((state) => state.container);
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
  const { icds } = useSelector((state) => state.icd);
  const yards = useSelector((state) => state.yards);
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
    manufacturedBy: "",
    inspectionDate: "",
    nameOfIcd: "", // ICD Data
    inspectedBy: "", // Yard Data
  });

  useEffect(() => {
    const fetchData = async () => {
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
      } else if (containerNumber) {
        try {
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
        } catch (err) {
          console.error("Failed to fetch container from API", err);
        }
      }
    };

    fetchData();
  }, [containerNumber, location.state, selectedOperation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    console.log(formData, "this is formData");

    const payload = {
      ...formData,
      shippingLineId: parseInt(formData.shippingLineId),
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
          `YOU HAVE SUCCESSFULLY SAVED ONHIRE OPERATION FOR ${containerNumber}. WHERE ENTRY ID IS ${response.data.id}`
        );
        navigate(`${process.env.PUBLIC_URL}/app/operation/${layoutURL}`);
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error("Error while creating container:", error);
    }
  };

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="On Hire of Container"
        parent="Apps"
        title="On Hire of Container"
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
                <h5 className="mb-3 mt-5">ON Hire Details</h5>
                <Row className="mb-3">
                  <Col md="4">
                    <label>Manufactured By</label>
                    <input
                      name="manufacturedBy"
                      type="text"
                      placeholder="Manufactured By"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.manufacturedBy}
                    />
                  </Col>
                  <Col md="4">
                    <label>Inspection Date</label>
                    <input
                      name="inspectionDate"
                      type="date"
                      placeholder="Manufactured By"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.inspectionDate}
                    />
                  </Col>
                  <Col md="4">
                    <label>Name Of ICD</label>
                    <select
                      name="nameOfIcd"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.nameOfIcd}
                    >
                      <option value="">Select ICD</option>
                      {icds &&
                        icds.map((res) => {
                          return (
                            <option key={res.id} value={res.id}>
                              {res.name}
                            </option>
                          );
                        })}
                    </select>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md="4">
                    <label>Yard Name</label>
                    <select
                      name="nameOfYard"
                      className="form-select"
                      onChange={handleChange}
                      value={formData.nameOfYard}
                    >
                      <option value="">Select Yard</option>
                      {yards &&
                        yards.data &&
                        yards.data.map((res) => {
                          return (
                            <option key={res.id} value={res.id}>
                              {res.name}
                            </option>
                          );
                        })}
                    </select>
                  </Col>
                  <Col md="4">
                    <label>Inspected By</label>
                    <input
                      name="inspectedBy"
                      type="text"
                      placeholder="Inspected By"
                      className="form-control"
                      onChange={handleChange}
                      value={formData.inspectedBy}
                    />
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

export default OnHire;
