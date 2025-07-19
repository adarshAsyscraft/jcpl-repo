import React, { useContext } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Radio,
  Select,
} from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createForwarder } from "../../../Redux/slices/forwarderSlice";
import CustomizerContext from "../../../_helper/Customizer";

const AddForwarders = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const layoutURL = useContext(CustomizerContext);

  const onFinish = async (values) => {
    try {
      await dispatch(createForwarder(values)).unwrap();
      message.success("Forwarder created successfully!");
      form.resetFields();
      navigate(`/dashboard/forwarders/Admin`);
    } catch (error) {
      message.error("Failed to create forwarder. Please try again.");
      console.error("Forwarder creation error:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Forwarders" parent="Apps" title="Add Forwarder" />
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
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "Name is required" },
                  { min: 3, message: "Name must be at least 3 characters" },
                ]}
              >
                <Input placeholder="Enter Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Code"
                name="code"
                rules={[
                  { required: true, message: "Code is required" },
                  {
                    pattern: /^[A-Za-z0-9_-]+$/,
                    message: "Code must be alphanumeric with - or _ allowed",
                  },
                ]}
              >
                <Input placeholder="Enter Code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="JCPL Client"
                name="client"
                rules={[{ required: true, message: "Please select client type" }]}
              >
                <Radio.Group>
                  <Radio value={true}>JCPL Client</Radio>
                  <Radio value={false}>Not JCPL Client</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: "Please select a category" }]}
              >
                <Select placeholder="Select Category">
                  <Select.Option value="Shipping">Shipping</Select.Option>
                  <Select.Option value="Forwarder">Forwarder</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            
            <Col span={12}>
              <Form.Item
                label="Address"
                name="address"
                rules={[
                  { required: true, message: "Address is required" },
                  { min: 5, message: "Address must be at least 5 characters" },
                ]}
              >
                <Input placeholder="Enter Address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Pin Code"
                name="pinCode"
                rules={[
                  {
                    pattern: /^[0-9]{5,6}$/,
                    message: "Enter valid Pin Code (5 or 6 digits)",
                  },
                ]}
              >
                <Input placeholder="Enter Pin Code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
           
            <Col span={12}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Country is required" }]}
              >
                <Input placeholder="Enter Country" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                label="Phone Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Phone number is required" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits",
                  },
                ]}
              >
                <Input placeholder="Enter Phone Number" />
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
                <Input placeholder="Enter Contact Person" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Person Mobile"
                name="cpMobileNumber"
                rules={[
                  { required: true, message: "Mobile number is required" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Mobile number must be 10 digits",
                  },
                ]}
              >
                <Input placeholder="Enter CP Mobile Number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            
            <Col span={12}>
              <Form.Item
                label="GST ID"
                name="taxId_GST"
                rules={[
                  {
                    message: "Enter valid GST number",
                  },
                ]}
              >
                <Input placeholder="Enter GST ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tax Number"
                name="taxNumber"
                rules={[
                  {
                    pattern: /^[A-Za-z0-9-]+$/,
                    message: "Invalid tax number",
                  },
                ]}
              >
                <Input placeholder="Enter Tax Number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            
            <Col span={12}>
              <Form.Item
                label="Remark"
                name="remark"
                rules={[
                  { max: 250, message: "Remark can be maximum 250 characters" },
                ]}
              >
                <Input.TextArea placeholder="Enter Remark" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Col span={12} key={num}>
                <Form.Item
                  label={`Email ${num}`}
                  name={`email${num}`}
                  rules={[
                    {
                      type: "email",
                      message: "Enter a valid email",
                    },
                  ]}
                >
                  <Input placeholder={`Enter Email ${num}`} />
                </Form.Item>
              </Col>
            ))}
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

export default AddForwarders;
