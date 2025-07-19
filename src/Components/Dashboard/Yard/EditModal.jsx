import React, { useEffect } from "react";
import { Modal, Form, Input, Row, Col, Button, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateYard, fetchYards } from "../../../Redux/slices/yardSlice";
import { fetchICDs } from "../../../Redux/slices/icdsSlice";
import { useNavigate } from "react-router";

const { Option } = Select;

const EditYard = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { icds } = useSelector((state) => state.icd);

  useEffect(() => {
    if (icds.length === 0) {
      dispatch(fetchICDs());
    }
  }, [dispatch, icds]);

  useEffect(() => {
    if (category && icds.length > 0) {
      form.setFieldsValue({
        name: category.name,
        icdId: category.icdId,
      });
    }
  }, [category, form, icds]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateYard({ id: category.id, updatedData: values })).unwrap();
      setEditModal(false);
      dispatch(fetchYards());
      navigate("/dashboard/yards/Admin");
    } catch (error) {
      console.error("Yard update error:", error);
    }
  };

  return (
    <Modal
      title="Edit Yard"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={600}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name is required" }]}>
              <Input placeholder="Enter Yard Name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="ICD" name="icdId" rules={[{ required: true, message: "ICD is required" }]}>
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

        <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
          <Button onClick={() => setEditModal(false)} style={{ marginRight: 10 }}>
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

export default EditYard;