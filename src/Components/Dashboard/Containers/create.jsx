import React, { useContext, useEffect } from "react";
import { Form, Input, Button, Card, Row, Col, Space, DatePicker, message, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { createContainer } from "../../../Redux/slices/containerSlice";
import dayjs from "dayjs";
import { fetchContainerTypes } from "../../../Redux/slices/containerTypesSlice";
import { fetchForwarders } from "../../../Redux/slices/forwarderSlice";

const AddContainers = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { layoutURL } = useContext(CustomizerContext);
  const { data } = useSelector((state) => state.containerTypes);
  const res = useSelector((state) => state.forwarders);

  const onFinish = async (values) => {
    try {
      const payload = {
        containerNumber: values.containerNumber,
        shippingLineId: parseInt(values.shippingLineId),
        size: values.size,
        containerType: values.containerType,
        tareWeight: values.tareWeight,
        mgWeight: values.mgWeight,
        mfdDate: values.mfdDate ? dayjs(values.mfdDate).format("YYYY-MM") : null,
        cscValidity: values.cscValidity ? dayjs(values.cscValidity).format("YYYY-MM-DD") : null,
        remarks: values.remarks,
      };

      await dispatch(createContainer(payload)).unwrap();
      message.success("Container created successfully!");
      form.resetFields();
      navigate(`/dashboard/containers/Admin`);
    } catch (error) {
      console.error("Error creating container:", error);
      message.error("Failed to create container. Please try again.");
    }
  };

  useEffect(() => {
    dispatch(fetchContainerTypes());
    dispatch(fetchForwarders());
  }, []);

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Containers" parent="Apps" title="Add Container" />
      <Card
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Container Number"
                name="containerNumber"
                rules={[
                  { required: true, message: "Container Number is required" },
                  { min: 11, message: "Container Number must be exactly 11 characters" },
                  { max: 11, message: "Container Number must be exactly 11 characters" },
                ]}
              >
                <Input placeholder="Enter container number (e.g., ABC1234567)" maxLength={11} />
              </Form.Item>

            </Col>
            <Col span={12}>
              <Form.Item
                label="Shipping Line ID"
                name="shippingLineId"
                rules={[{ required: true, message: "Shipping Line ID is required" }]}
              >
                <Select placeholder="Select Shipping Line ID">
                  {
                    res.data && res.data?.map((d) => (
                      <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Size"
                name="size"
                rules={[{ required: true, message: "Size is required" }]}
              >
                <Select placeholder="Select size">
                  <Select.Option value="20">20</Select.Option>
                  <Select.Option value="40">40</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Container Type"
                name="containerType"
                rules={[{ required: true, message: "Container Type is required" }]}
              >
                <Select placeholder="Select container type">
                  {data?.map((type) => (
                    <Select.Option key={type.id} value={type.code}>
                      {type.code}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tare Weight (KG)"
                name="tareWeight"
                rules={[
                  { pattern: /^\d{4}$/, message: "Tare Weight must be exactly 4 digits" },
                ]}
              >
                <Input maxLength={5} placeholder="Enter tare weight (5 digits)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="MG Weight (KG)"
                name="mgWeight"
                rules={[
                  { pattern: /^\d{5}$/, message: "MG Weight must be exactly 5 digits" }
                ]}
              >
                <Input maxLength={5} placeholder="Enter MG weight (5 digits)" />
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Manufacture Date" name="mfdDate">
                <DatePicker picker="month" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ACEP" name="cscValidity">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Remarks" name="remarks">
                <Input.TextArea placeholder="Any remarks or comments..." autoSize={{ minRows: 3 }} />
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

export default AddContainers;
