import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import usersService from "../../../Services/users";
import { fetchAllUsers, updateUser } from "../../../Redux/slices/allUserSlice";

const EditModal = ({ category, editModal, setEditModal }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    designation: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        userName: category.userName || "",
        firstName: category.firstName || "",
        lastName: category.lastName || "",
        email: category.email || "",
        mobileNumber: category.mobileNumber || "",
        designation: category.designation || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    const updatedData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value !== category[key])
    );

    if (Object.keys(updatedData).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      await usersService.update(category.id, updatedData);
      dispatch(updateUser({ id: category.id, userData: updatedData })); // Update Redux
      dispatch(fetchAllUsers()); // Refresh user list
      toast.success("User updated successfully!");
      setEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user.");
    }
  };

  return (
    <Modal title="Edit User" open={editModal} onCancel={() => setEditModal(false)} footer={null} centered>
      <Form layout="vertical">
        <Form.Item label={<b>User Name</b>}>
          <Input name="userName" value={formData.userName} onChange={handleChange} />
        </Form.Item>
        <Form.Item label={<b>First Name</b>}>
          <Input name="firstName" value={formData.firstName} onChange={handleChange} />
        </Form.Item>
        <Form.Item label={<b>Last Name</b>}>
          <Input name="lastName" value={formData.lastName} onChange={handleChange} />
        </Form.Item>
        <Form.Item label={<b>Email</b>}>
          <Input name="email" value={formData.email} onChange={handleChange} disabled />
        </Form.Item>
        <Form.Item label={<b>Mobile Number</b>}>
          <Input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
        </Form.Item>
        <Form.Item label={<b>Designation</b>}>
          <Input name="designation" value={formData.designation} onChange={handleChange} />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => setEditModal(false)}>Close</Button>
          <Button type="primary" onClick={handleUpdate} style={{ marginLeft: 8 }}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
