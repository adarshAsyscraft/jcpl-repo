import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, Button, message, Radio } from "antd";
import { useDispatch } from "react-redux";
import {
  updateForwarder,
  fetchForwarders,
} from "../../../Redux/slices/forwarderSlice";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const EditForwarders = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        code: category.code,
        client: category.client == 1 ? true : false,
        address: category.address,
        pinCode: category.pinCode,
        country: category.country,
        state: category.state,
        city: category.city,
        phoneNumber: category.phoneNumber,
        contactPerson: category.contactPerson,
        cpMobileNumber: category.cpMobileNumber,
        taxId_GST: category.taxId_GST,
        taxNumber: category.taxNumber,
        remark: category.remark,
        email1: category.email1,
        email2: category.email2,
        email3: category.email3,
        email4: category.email4,
        email5: category.email5,
      });
    }
  }, [category, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const res = await dispatch(
        updateForwarder({ id: category.id, updatedData: values })
      ).unwrap();
      if (res.success) {
        toast.success("Forwarder Updated Successfully!");
        setEditModal(false);
        dispatch(fetchForwarders());
        navigate("/dashboard/forwarders/Admin");
      }
    } catch (error) {
      console.log("error::", error);
      message.error("Failed to update forwarder. Please try again.");
    }
  };

  console.log("client::");

  return (
    <Modal
      title="Edit Forwarder"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={900}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Name" name="name" rules={[{ required: true }]}>
              <Input placeholder="Enter Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Code" name="code" rules={[{ required: true }]}>
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
              label="Address"
              name="address"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Pin Code" name="pinCode">
              <Input placeholder="Enter Pin Code" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Country" name="country">
              <Input placeholder="Enter Country" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="State" name="state">
              <Input placeholder="Enter State" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="City" name="city">
              <Input placeholder="Enter City" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phone Number" name="phoneNumber">
              <Input placeholder="Enter Phone Number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Person" name="contactPerson">
              <Input placeholder="Enter Contact Person" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Contact Person Mobile" name="cpMobileNumber">
              <Input placeholder="Enter CP Mobile Number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="GST ID" name="taxId_GST">
              <Input placeholder="Enter GST ID" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tax Number" name="taxNumber">
              <Input placeholder="Enter Tax Number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Remark" name="remark">
              <Input.TextArea placeholder="Enter Remark" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {[1, 2, 3, 4, 5].map((num) => (
            <Col span={12} key={num}>
              <Form.Item label={`Email ${num}`} name={`email${num}`}>
                <Input placeholder={`Enter Email ${num}`} />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
          <Button
            onClick={() => setEditModal(false)}
            style={{ marginRight: 10 }}
          >
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

export default EditForwarders;
