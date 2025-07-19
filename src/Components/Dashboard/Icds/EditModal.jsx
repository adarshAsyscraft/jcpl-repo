import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Space, Row, Col } from "antd";
import { useDispatch } from "react-redux";
import { updateICD, fetchICDs } from "../../../Redux/slices/icdsSlice";
import { useNavigate } from "react-router";

const EditModal = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        code: category.code,
        address1: category.address1,
        address2: category.address2,
        address3: category.address3,
        country: category.country,
        state: category.state,
        contactPerson1: category.contactPerson1,
        cp1MobileNumber: category.cp1MobileNumber,
        email: category.email,
        geoLocation: category.geoLocation,
        yards: category.yards || [],
      });
    }
  }, [category, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      dispatch(updateICD({ id: category.id, data: values })).then(() => {
        dispatch(fetchICDs());
        setEditModal(false);
        navigate(`/dashboard/icds/Admin`);
      });
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title="Edit ICD"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      width={800} // Wider modal
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="ICD Name" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Code" name="code" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Address 1" name="address1">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Address 2" name="address2">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Address 3" name="address3">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Country" name="country">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="State" name="state">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Contact Person" name="contactPerson1">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Mobile Number" name="cp1MobileNumber">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Geo Location" name="geoLocation">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* Yards Section */}
        {/* Uncomment this if you want to allow yard editing */}
        {/* 
        <Form.List name="yards">
          {(fields, { add, remove }) => (
            <>
              <label><strong>Yards</strong></label>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={16} align="middle">
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[{ required: true, message: "Yard Name is required" }]}
                    >
                      <Input placeholder="Yard Name" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      {...restField}
                      name={[name, "code"]}
                      rules={[{ required: true, message: "Yard Code is required" }]}
                    >
                      <Input placeholder="Yard Code" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ fontSize: 20, color: 'red' }} />
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add Yard
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        */}

        <Form.Item>
          <Space style={{ display: "flex", justifyContent: "end" }}>
            <Button onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="primary" onClick={handleUpdate}>
              Update ICD
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
