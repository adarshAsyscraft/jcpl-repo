import React from "react";
import { Form, Input, Button, Card, Row, Col, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createTransporter } from "../../../Redux/slices/transporterSlice";

const AddTransporters = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        contactPerson: values.contactPerson,
        mobile: values.mobile,
        email: values.email,
        address: values.address,
      };

      await dispatch(createTransporter(payload)).unwrap();
      form.resetFields();
      navigate(`/dashboard/transporter/Admin`);
    } catch (error) {
      console.error("Error creating transporter:", error);
      message.error("Failed to create transporter. Please try again.");
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Transporters" parent="Apps" title="Add Transporters" />
      <Card
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: "700px", margin: "0 auto" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="Enter transporter name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Code"
                name="code"
                rules={[{ required: true, message: "Code is required" }]}
              >
                <Input placeholder="Enter transporter code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[{ required: true, message: "Contact Person is required" }]}
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mobile"
                name="mobile"
                rules={[
                  { required: true, message: "Mobile number is required" },
                  { pattern: /^\d{10}$/, message: "Enter a valid 10-digit mobile number" },
                ]}
              >
                <Input placeholder="Enter mobile number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>
                Submit
              </Button>
              <Button onClick={() => form.resetFields()} style={{ minWidth: "120px", background: "#f5f5f5" }}>
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddTransporters;
