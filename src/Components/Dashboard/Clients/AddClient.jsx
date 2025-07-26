import React, { useState } from "react";
import { Form, Input, Button, Card, Row, Col, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import ClientService from "../../../Services/clientApi";

const AddClient = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const payload = {
        clientName: values.clientName,
        address: values.address,
        pinCode: values.pinCode,
        country: values.country,
        state: values.state,
        city: values.city,
        contactPerson: values.contactPerson,
        cpMobileNumber: values.cpMobileNumber,
        taxId_GST: values.taxId_GST,
        remark: values.remark,
      };

      const result = await ClientService.create(payload);
      console.log(result);

      if (result.success) {
        console.log("Submitted values:", payload);
        message.success("Client created successfully!");
        form.resetFields();
        navigate(`/dashboard/survey-clients/Admin`);
      }
    } catch (error) {
      message.error("Failed to create Client. Please try again.");
      console.error("Client creation error:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Clients" parent="Apps" title="Add Client" />
      <Card
        style={{
          width: "100%",
          maxWidth: "1200px",
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
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Client Name"
                name="clientName"
                rules={[{ required: true, message: "Client Name is required" }]}
              >
                <Input placeholder="Enter Client Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
                rules={[{ required: true, message: "Address is required" }]}
              >
                <Input placeholder="Enter Address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Pin Code"
                name="pinCode"
                rules={[{ required: true, message: "Pin Code is required" }]}
              >
                <Input placeholder="Enter Pin Code" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Country is required" }]}
              >
                <Input placeholder="Enter Country" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "State is required" }]}
              >
                <Input placeholder="Enter State" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "City is required" }]}
              >
                <Input placeholder="Enter City" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[
                  { required: true, message: "Contact Person is required" },
                ]}
              >
                <Input placeholder="Enter Contact Person" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mobile Number"
                name="cpMobileNumber"
                rules={[
                  { required: true, message: "Mobile Number is required" },
                ]}
              >
                <Input placeholder="Enter Mobile Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="GST / Tax ID"
                name="taxId_GST"
                rules={[
                  { required: true, message: "Tax ID / GST is required" },
                ]}
              >
                <Input placeholder="Enter GST / Tax ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item label="Remark" name="remark">
                <Input.TextArea rows={3} placeholder="Enter any remarks" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{ minWidth: "120px" }}
              >
                Submit
              </Button>
              <Button
                onClick={() => form.resetFields()}
                style={{ minWidth: "120px", background: "#f5f5f5" }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddClient;
