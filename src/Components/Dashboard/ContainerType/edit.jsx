import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  updateContainerTypes,
  fetchContainerTypes,
} from "../../../Redux/slices/containerTypesSlice";

const EditContainerTypes = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await dispatch(
        updateContainerTypes({ id: category.id, updatedData: formData })
      ).unwrap();
      setEditModal(false);
      await dispatch(fetchContainerTypes());
      navigate("/dashboard/containerTypes/Admin");
    } catch (error) {
      console.error("Error updating container type:", error);
    }
  };

  return (
    <Modal
      title="Edit Container Type"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="Code">
          <Input name="code" value={formData.code} onChange={handleChange} />
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

export default EditContainerTypes;
