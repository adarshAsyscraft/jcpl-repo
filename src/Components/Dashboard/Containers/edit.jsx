import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Row, Col, Button, Select } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { updateContainer } from "../../../Redux/slices/containerSlice";
import { useNavigate } from "react-router";
import { fetchContainerTypes } from "../../../Redux/slices/containerTypesSlice";
import { fetchForwarders } from "../../../Redux/slices/forwarderSlice";

const EditContainers = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.containerTypes);
  const [form] = Form.useForm();
  const res = useSelector((state) => state.forwarders);


  useEffect(() => {
    dispatch(fetchContainerTypes());
    dispatch(fetchForwarders());
  }, [dispatch]);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
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
  }, [category, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

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

      await dispatch(updateContainer({ id: category.id, updatedData: payload })).unwrap();
      toast.success("Container updated successfully!");
      setEditModal(false);
      navigate(`/dashboard/containers/Admin`);
    } catch (error) {
      toast.error(error?.message || "Failed to update container.");
    }
  };

  return (
    <Modal
      title="Edit Container"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Container Number"
              name="containerNumber"
              rules={[{ required: true, message: "Container number is required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Shipping Line"
              name="shippingLineId"
              rules={[{ required: true, message: "Shipping Line is required" }]}
            >
              <Select placeholder="Select Shipping Line">
                {res.data?.map((line) => (
                  <Select.Option key={line.id} value={line.id}>
                    {line.name}
                  </Select.Option>
                ))}
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

        <Form.Item label="Remarks" name="remarks">
          <Input.TextArea autoSize={{ minRows: 2 }} />
        </Form.Item>

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

export default EditContainers;
