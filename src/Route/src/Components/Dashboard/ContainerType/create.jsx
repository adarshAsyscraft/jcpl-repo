import React from "react";
import { Form, Input, Button, Card, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createContainerTypes } from "../../../Redux/slices/containerTypesSlice";

const AddContainerTypes = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      const payload = {
        code: values.code,
      };

      await dispatch(createContainerTypes(payload)).unwrap();
      form.resetFields();
      navigate(`/dashboard/containerTypes/Admin`);
    } catch (error) {
      console.error("Error creating container type:", error);
      message.error("Failed to create container type. Please try again.");
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="ContainerTypes" parent="Apps" title="Add ContainerType" />
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
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
          style={{ maxWidth: "500px", margin: "0 auto" }}
        >
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Code is required" }]}
          >
            <Input placeholder="Enter container type code" />
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>
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

export default AddContainerTypes;
