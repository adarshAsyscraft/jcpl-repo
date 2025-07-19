import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, Button } from "antd";
import { useDispatch } from "react-redux";
import { fetchTransporters, updateTransporter } from "../../../Redux/slices/transporterSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const EditTransporters = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name || "",
        contactPerson: category.contactPerson || "",
        mobile: category.mobile || "",
        email: category.email || "",
        address: category.address || "",
      });
    }
  }, [category, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const res = await dispatch(updateTransporter({ id: category.id, updatedData: values }));
      if(res.payload.success){
        setEditModal(false);
        navigate("/dashboard/transporter/Admin");
        dispatch(fetchTransporters());
        toast.success("Transporter updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update transporter.");
    }
  };

  return (
    <Modal
      title="Edit Transporter"
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
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Person" name="contactPerson">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mobile"
              name="mobile"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>
        </Row>

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

export default EditTransporters;
