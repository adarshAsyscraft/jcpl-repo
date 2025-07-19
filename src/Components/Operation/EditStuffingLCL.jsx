import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, Button, Select } from "antd";
import { fetchForwarders } from "../../Redux/slices/forwarderSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import moment from "moment";

const EditCartingModal = ({ open, onClose, formData, onChange, onSave }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const forwardersState = useSelector((state) => state.forwarders || {});
  const forwarders = forwardersState?.data || [];

  useEffect(() => {
    if (open && formData) {
      const formattedData = {
        ...formData,
        ship_bill_date: formData.ship_bill_date
          ? moment(formData.ship_bill_date).format("DD-MM-YYYY")
          : "",
        cbm:
          formData?.cbm != null ? parseFloat(formData.cbm).toFixed(3) : "0.000",
      };

      form.setFieldsValue(formattedData);
    }
  }, [open, formData, form]);

  useEffect(() => {
    dispatch(fetchForwarders);
  }, [dispatch]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      onSave(values); // send updated data back to parent
      onClose();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Carting Details"
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Shipping/Forwarder Name"
              name="shipping_line_forwarder_name"
            >
              <select
                name="forwarder1Id"
                style={{ width: "100%" }}
                className="form-select form-control"
                disabled
                size="middle"
                value={formData.forwarder1Id}
              >
                <option value="">Select Forwarder</option>
                {forwarders.map((fwd) => (
                  <option key={fwd.id} value={fwd.id}>
                    {fwd.name}
                  </option>
                ))}
              </select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ship Bill Number" name="ship_bill_number">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Ship Bill Date" name="ship_bill_date">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Shipper Name" name="shipper">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Consignee Name" name="consignee">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Cargo Type" name="cargo">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Cargo Weight (kg)" name="cargo_weight">
              <Input type="number" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Packed In" name="packed_in">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Packages" name="packages">
              <Input type="number" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="CBM" name="cbm">
              <Input type="number" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Marks" name="marks">
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Remarks" name="remarks">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
          <Button onClick={onClose} style={{ marginRight: 10 }}>
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

export default EditCartingModal;
