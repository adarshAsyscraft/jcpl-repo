import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Row, Col, Button } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { updateContainer } from "../../../Redux/slices/container";
import { useNavigate } from "react-router";

const EditContainers = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    containerNumber: "",
    shippingLineId: "",
    size: "",
    containerType: "",
    tareWeight: "",
    mgWeight: "",
    mfdDate: null,
    cscValidity: null,
    remarks: "",
  });

  // Category data se initial form state update karega
  useEffect(() => {
    if (category) {
      setFormData({
        containerNumber: category.container_number || "",
        shippingLineId: category.shipping_line_id || "",
        size: category.size || "",
        containerType: category.container_type || "",
        tareWeight: category.tare_weight || "",
        mgWeight: category.mg_weight || "",
        mfdDate: category.mfd_date ? dayjs(category.mfd_date) : null,
        cscValidity: category.csc_validity ? dayjs(category.csc_validity) : null,
        remarks: category.remarks || "",
      });
    }
  }, [category]);

  // Input change handle karega
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Date change handle karega
  const handleDateChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // API Call to Update Container
  const handleUpdate = async () => {
    const payload = {
      containerNumber: formData.containerNumber,
      shippingLineId: parseInt(formData.shippingLineId),
      size: formData.size,
      containerType: formData.containerType,
      tareWeight: formData.tareWeight,
      mgWeight: formData.mgWeight,
      mfdDate: formData.mfdDate ? dayjs(formData.mfdDate).format("YYYY-MM-DD") : null,
      cscValidity: formData.cscValidity ? dayjs(formData.cscValidity).format("YYYY-MM-DD") : null,
      remarks: formData.remarks,
    };

    try {
      await dispatch(updateContainer({ id: category.id, updatedData: payload })).unwrap();
      navigate(`/dashboard/containers/Admin`);
      toast.success("Container updated successfully!");
      setEditModal(false);
    } catch (error) {
      toast.error(error?.message || "Failed to update container.");
    }
  };

  return (
    <Modal title="Edit Container" open={editModal} onCancel={() => setEditModal(false)} footer={null} centered width={800}>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Container Number">
              <Input name="containerNumber" value={formData.containerNumber} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Shipping Line ID">
              <Input name="shippingLineId" type="number" value={formData.shippingLineId} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Size">
              <Input name="size" value={formData.size} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Container Type">
              <Input name="containerType" value={formData.containerType} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tare Weight (KG)">
              <Input name="tareWeight" type="number" value={formData.tareWeight} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="MG Weight (KG)">
              <Input name="mgWeight" type="number" value={formData.mgWeight} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Manufacture Date">
              <DatePicker style={{ width: "100%" }} value={formData.mfdDate} onChange={(date) => handleDateChange("mfdDate", date)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="CSC Validity">
              <DatePicker style={{ width: "100%" }} value={formData.cscValidity} onChange={(date) => handleDateChange("cscValidity", date)} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Remarks">
          <Input.TextArea name="remarks" value={formData.remarks} onChange={handleChange} autoSize={{ minRows: 2 }} />
        </Form.Item>

        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={() => setEditModal(false)} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" onClick={handleUpdate}>Save</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditContainers;
