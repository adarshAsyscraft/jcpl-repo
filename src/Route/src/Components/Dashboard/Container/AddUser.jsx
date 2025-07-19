import React, { useContext } from "react";
import { Form, Input, Button, Card, Row, Col, Space, DatePicker, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { createContainer } from "../../../Redux/slices/container";
import dayjs from "dayjs";

const AddContainers = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { layoutURL } = useContext(CustomizerContext);

  const onFinish = async (values) => {
    try {
      const payload = {
        containerNumber: values.containerNumber,
        shippingLineId: parseInt(values.shippingLineId),
        size: values.size,
        containerType: values.containerType,
        tareWeight: values.tareWeight,
        mgWeight: values.mgWeight,
        mfdDate: dayjs(values.mfdDate).format("YYYY-MM-DD"),
        cscValidity: dayjs(values.cscValidity).format("YYYY-MM-DD"),
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
              <Form.Item label="Container Number" name="containerNumber" rules={[{ required: true, message: "Container Number is required" }]}>
                <Input placeholder="Enter container number (e.g., ABC1234567)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Shipping Line ID" name="shippingLineId" rules={[{ required: true, message: "Shipping Line ID is required" }]}>
                <Input placeholder="Enter shipping line ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Size" name="size" rules={[{ required: true, message: "Size is required" }]}>
                <Input placeholder="Enter size (e.g., 20, 40, 45)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Container Type" name="containerType" rules={[{ required: true, message: "Container Type is required" }]}>
                <Input placeholder="Enter container type (e.g., Dry, Reefer, Open Top)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tare Weight (KG)" name="tareWeight" rules={[{ required: true, message: "Tare Weight is required" }]}>
                <Input type="number" placeholder="Enter tare weight" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="MG Weight (KG)" name="mgWeight" rules={[{ required: true, message: "MG Weight is required" }]}>
                <Input type="number" placeholder="Enter MG weight" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Manufacture Date" name="mfdDate" rules={[{ required: true, message: "Manufacture Date is required" }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CSC Validity" name="cscValidity" rules={[{ required: true, message: "CSC Validity is required" }]}>
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
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>Submit</Button>
              <Button onClick={() => form.resetFields()} style={{ minWidth: "120px", background: "#f5f5f5" }}>Reset</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddContainers;
