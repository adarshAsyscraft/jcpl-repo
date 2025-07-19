import React, { Fragment, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import CustomizerContext from "../../_helper/Customizer";
import { useSelector, useDispatch } from "react-redux";
import { fetchContainerByNumber } from "../../Redux/slices/containerSlice";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { fetchYards } from "../../Redux/slices/yardSlice";
import { fetchICDs } from "../../Redux/slices/icdsSlice";
import ContainerDetailsSection from "./containerDetails";
import operationService from "../../Services/operation";
import { toast } from "react-toastify";

const EmptyContainerInspection = () => {
    const { layoutURL } = useContext(CustomizerContext);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedOperation = location.state?.operation || "";
    const { containerNumber } = useParams();
    const { icds } = useSelector((state) => state.icd);
    const yards = useSelector((state) => state.yards);

    const { fetchedContainer } = useSelector((state) => state.container);
    const { data: forwarders = [] } = useSelector((state) => state.forwarders || {});
    const { data: containerTypes = [] } = useSelector((state) => state.containerTypes || {});

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
        nameOfIcd: "",
        inspectedBy: "",
        dateOfInspection: "",
        pol: "",
        shippingLineSeal: "",
        containerCondition: "",
        anyOtherCondition: "",
        remarks: ""
    });

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

    useEffect(() => {
        dispatch(fetchContainerByNumber(containerNumber));
        dispatch(fetchForwarders());
        dispatch(fetchContainerTypes());
        dispatch(fetchYards());
        dispatch(fetchICDs());
    }, [dispatch, containerNumber]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const payload = {
            "containerNumber": "ABD1234567",
            "client_name": "XYZ Logistics",
            "size_type": "40ft HC",
            "tare_weight": 2200.5,
            "mg_weight": 30480.0,
            "mfd_date": "2024-03-01",
            "csc_validity": "2026-03-01",
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

        const response = await operationService.emptyContainerInspection(payload);
        if (response.success) {
            toast.success("Empty Container Empty created successfully");
            navigate(`${process.env.PUBLIC_URL}/app/operation/Admin`);
        }
    };

    return (
        <Fragment>
            <Breadcrumbs mainTitle="Empty Container Inspection" parent="Apps" title="Empty Container Inspection" />
            <Container fluid={true} className="container-wrap">
                <Row>
                    <Col sm="12">
                        <div className="card shadow p-4">
                            <ContainerDetailsSection
                                formData={formData}
                                handleChange={handleChange}
                                forwarders={forwarders}
                                forwardersLoading={false}
                                fetchedContainer={fetchedContainer}
                                disabled={true}
                            />

                            <Row className="mb-3 mt-4">
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
                                    <input placeholder="Inspected By" name="inspectedBy" type="text" className="form-control" value={formData.inspectedBy} onChange={handleChange} />
                                </Col>
                                <Col md="6">
                                    <label className="form-label">Date Of Inspection</label>
                                    <input name="dateOfInspection" type="date" className="form-control" value={formData.dateOfInspection} onChange={handleChange} />
                                </Col>
                            </Row>

                            <h5 className="mb-3 mt-4">Container Condition</h5>
                            <Row className="mb-3">
                                <Col md="6">
                                    <label className="form-label">Remarks</label>
                                    <textarea placeholder="Remarks" name="remarks" className="form-control" rows="3" onChange={handleChange} value={formData.remarks} />
                                </Col>
                            </Row>

                            <div className="text-center">
                                <button className="btn btn-primary w-100" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
};

export default EmptyContainerInspection;
