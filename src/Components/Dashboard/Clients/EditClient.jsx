import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Space, Row, Col } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ClientService from "../../../Services/clientApi";
// import { updateClient, fetchClients } from "../../../Redux/slices/clientsSlice";

const EditClientModal = ({ client, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (client) {
      form.setFieldsValue({
        clientName: client.clientName,
        address: client.address,
        pinCode: client.pinCode,
        country: client.country,
        state: client.state,
        city: client.city,
        contactPerson: client.contactPerson,
        cpMobileNumber: client.cpMobileNumber,
        taxId_GST: client.taxId_GST,
        remark: client.remark,
      });
    }
  }, [client, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

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

      const res = await ClientService.update(client.id, payload); // API call to update client
      console.log("res::", res);
      if (res) {
      }
      toast.success("Client updated successfully!");
      setEditModal(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update client");
    }
  };

  return (
    <Modal
      title="Edit Client"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      width={800}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Client Name"
              name="clientName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Country" name="country">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="State" name="state">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="City" name="city">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Person" name="contactPerson">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mobile Number" name="cpMobileNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="GST / Tax ID" name="taxId_GST">
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Remark" name="remark">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="primary" onClick={handleUpdate}>
              Update Client
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditClientModal;
