import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Row, Col, Button } from "antd";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchTransporters, updateTransporter } from "../../../Redux/slices/transporterSlice";
import { useNavigate } from "react-router";

const EditTransporters = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactPerson: "",
    mobile: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        code: category.code || "",
        contactPerson: category.contactPerson || "",
        mobile: category.mobile || "",
        email: category.email || "",
        address: category.address || "",
      });
    }
  }, [category]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Submit handler
  const handleUpdate = async () => {
    try {
      await dispatch(updateTransporter({ id: category.id, updatedData: formData }));
      setEditModal(false);
      navigate("/dashboard/transporter/Admin");
      await dispatch(fetchTransporters)
    } catch (error) {
      console.log("error::",error)
    }
  };

  return (
    <Modal
      title="Edit Transporter"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={800}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Name">
              <Input name="name" value={formData.name} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Code">
              <Input name="code" value={formData.code} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Contact Person">
              <Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mobile">
              <Input name="mobile" value={formData.mobile} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email">
              <Input name="email" value={formData.email} onChange={handleChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Address">
              <Input name="address" value={formData.address} onChange={handleChange} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={() => setEditModal(false)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleUpdate}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTransporters;
