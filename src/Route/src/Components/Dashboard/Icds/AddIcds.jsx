import React, { useState } from "react";
import { Form, Input, Button, Card, Row, Col, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createICD } from "../../../Redux/slices/icdsSlice";

const AddIcds = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      await dispatch(createICD(values)).unwrap();
      message.success("ICD created successfully!");
      form.resetFields();
      navigate(`/dashboard/icds/Admin`);
    } catch (error) {
      message.error("Failed to create ICD. Please try again.");
      console.error("ICD creation error:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="ICD" parent="Apps" title="Add ICD" />
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
              <Form.Item label="ICD Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
                <Input placeholder="Enter ICD Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ICD Code" name="code" rules={[{ required: true, message: "Code is required" }]}>
                <Input placeholder="Enter ICD Code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Address 1" name="address1" rules={[{ required: true, message: "Address1 is required" }]}>
                <Input placeholder="Enter Address 1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Address 2" name="address2">
                <Input placeholder="Enter Address 2" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Address 3" name="address3">
                <Input placeholder="Enter Address 3" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Country" name="country" rules={[{ required: true, message: "Country is required" }]}>
                <Input placeholder="Enter Country" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="State" name="state" rules={[{ required: true, message: "State is required" }]}>
                <Input placeholder="Enter State" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Contact Person" name="contactPerson1" rules={[{ required: true, message: "Contact Person is required" }]}>
                <Input placeholder="Enter Contact Person Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mobile Number" name="cp1MobileNumber" rules={[{ required: true, message: "Mobile number is required" }]}>
                <Input placeholder="Enter Mobile Number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
                <Input placeholder="Enter Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Geo Location" name="geoLocation" rules={[{ required: true, message: "Geo Location is required" }]}>
                <Input placeholder="Enter Geo Location (Lat, Long)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Dynamic Yards */}
          <Form.List name="yards" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} align="middle">
                    <Col span={10}>
                      <Form.Item {...restField} name={[name, "name"]} label="Yard Name" rules={[{ required: true }]}>
                        <Input placeholder="Enter Yard Name" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item {...restField} name={[name, "code"]} label="Yard Code" rules={[{ required: true }]}>
                        <Input placeholder="Enter Yard Code" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button onClick={() => remove(name)} danger style={{ marginTop: "29px" }}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Yard
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>Submit</Button>
              <Button onClick={() => form.resetFields()} style={{ minWidth: "120px", background: "#f5f5f5" }}>Reset</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddIcds;
