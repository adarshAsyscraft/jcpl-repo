import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useDispatch, useSelector } from "react-redux";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import moment from "moment";
import ContainerDetailsSection from "./containerDetails";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";

const SocInspection = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { containerNumber } = useParams();
  const selectedOperation = location.state?.operation || "";
  const { icds } = useSelector((state) => state.icd);
      const yards  = useSelector((state) => state.yards);

  const { fetchedContainer } = useSelector((state) => state.container);
  const { data: forwarders = [], loading: forwardersLoading, } = useSelector((state) => state.forwarders || {});

  const [formData, setFormData] = useState({
    containerNumber: "",
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
    manufacturedBy: "",
    dateOfInspection: "",
    nameOfIcd: "",
    inspectedBy: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(fetchContainerByNumber(containerNumber));
    dispatch(fetchForwarders());
    dispatch(fetchContainerTypes());
    dispatch(fetchYards());
    dispatch(fetchICDs())
  }, [dispatch, containerNumber]);

  useEffect(() => {
    if (fetchedContainer) {
      setFormData((prev) => ({
        ...prev,
        containerNumber: fetchedContainer.container_number || "",
        shippingLine: fetchedContainer.shipping_line_id || "",
        size: fetchedContainer.size || "",
        type: fetchedContainer.container_type || "",
        tareWeight: fetchedContainer.tare_weight || "",
        mgWeight: fetchedContainer.mg_weight || "",
        mfdDate: fetchedContainer.mfd_date || "",
        cscValidity: fetchedContainer.csc_validity || "",
      }));
    }
  }, [fetchedContainer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async() => {
    const payload = {
      "containerNumber": formData.containerNumber,
      "client_name": formData.client_name || "XYZ Logistics", //
      "size_type": formData.size || "40ft HC",
      "tare_weight": formData.tareWeight || null,
      "mg_weight": formData.mg_weight || null,
      "mfd_date": formData.mfdDate || null,
      "csc_validity": formData.cscValidity || null,
      "manufactured_by": 1,
      "date_of_inspection": "2025-03-25",
      "name_of_icd": "ICD Mumbai",
      "yard_name": "Yard A",
      "inspected_by": 3,
      "container_condition": "Good",
      "right_side_panel": "OK",
      "left_side_panel": "OK",
      "front_panel": "OK",
      "door_panels": "OK",
      "roof_panel": "OK",
      "floor": "WOODEN PCS FIXED ON FLOOR",
      "internal_panels": "BLACK MARKS",
      "under_structure": "NOT SIGHTED"
    }
     const response = await operationService.socInspection(payload);
     if(response.success){
      toast.success("SOC Inspection created Successfully");
      navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
     }
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="SOC Inspection" parent="Apps" title="SOC Inspection" />
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

              <h5 className="mb-3 mt-5">Inspection Details</h5>
              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Manufactured By</label>
                  <input name="manufacturedBy" placeholder="Manufactured By" type="text" className="form-control" onChange={handleChange} value={formData.manufacturedBy} />
                </Col>
                <Col md="6">
                  <label className="form-label">Date Of Inspection</label>
                  <input name="dateOfInspection" type="date" className="form-control" onChange={handleChange} value={formData.dateOfInspection} />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label>Name Of ICD</label>
                  <select name="nameOfIcd" className="form-select" onChange={handleChange} value={formData.nameOfIcd}>
                    <option value="">Select ICD</option>
                    {
                      icds && icds.map((res) => {
                        return <option key={res.id} value={res.id}>{res.name}</option>
                      })
                    }
                  </select>
                </Col>
                <Col md="6">
                  <label>Yard Name</label>
                  <select name="nameOfYard" className="form-select" onChange={handleChange} value={formData.nameOfYard}>
                    <option value="">Select Yard</option>
                    {
                      yards && yards.data && yards.data.map((res) => {
                        return <option key={res.id} value={res.id}>{res.name}</option>
                      })
                    }
                  </select>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md="6">
                  <label className="form-label">Inspected By</label>
                  <input name="inspectedBy" placeholder="Inspected By" type="text" className="form-control" onChange={handleChange} value={formData.inspectedBy} />
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Container Condition</h5>
              <Row className="mb-3">
                <Col md="12">
                  <label className="form-label">Remarks</label>
                  <textarea name="remarks" placeholder="Remarks" className="form-control" rows="3" onChange={handleChange} value={formData.remarks} />
                </Col>
              </Row>

              <div className="text-center">
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

export default SocInspection;
