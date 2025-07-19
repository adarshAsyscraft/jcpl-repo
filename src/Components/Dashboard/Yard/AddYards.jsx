import React, { useContext, useEffect } from "react";
import { Form, Input, Select, Button, Card, Row, Col, Space, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createYard } from "../../../Redux/slices/yardSlice";
import CustomizerContext from "../../../_helper/Customizer";
import { fetchICDs } from "../../../Redux/slices/icdsSlice";

const { Option } = Select;

const AddYards = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const layoutURL = useContext(CustomizerContext);

  const { data } = useSelector((state) => state.yards);
  const { icds } = useSelector((state) => state.icd);

  const onFinish = async (values) => {
    try {
      await dispatch(createYard(values)).unwrap();
      message.success("Yard created successfully!");
      form.resetFields();
      navigate(`${process.env.PUBLIC_URL}/dashboard/yards/${layoutURL}`);
    } catch (error) {
      message.error("Failed to create yard. Please try again.");
      console.error("Yard creation error:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Yards" parent="Apps" title="Add Yard" />
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Yard Name"
                name="name"
                rules={[{ required: true, message: "Yard name is required" }]}
              >
                <Input placeholder="Enter Yard Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Yard Code"
                name="code"
                rules={[{ required: true, message: "Yard code is required" }]}
              >
                <Input placeholder="Enter Yard Code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Select ICD"
                name="icdId"
                rules={[{ required: true, message: "ICD is required" }]}
              >
                <Select placeholder="Select ICD">
                  {icds.map((icd) => (
                    <Option key={icd.id} value={icd.id}>
                      {icd.name}
                    </Option>
                  ))}
                </Select>
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

export default AddYards;
