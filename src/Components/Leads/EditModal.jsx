import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import usersService from "../../Services/users";

const { Option } = Select;

const roleOptions = {
  '1': { label: "Admin", color: "green" },
  '2': { label: "User", color: "red" },
  '3': { label: "Gym Owner", color: "blue" },
  '4': { label: "Trainer", color: "yellow" },
};

const EditModal = ({ category, editModal, setEditModal }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("2"); // Default role
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setEmail(category.email || "");
      setPhone(category.phone || "");
      setRole(category.role || "2");
      setProfileImage(category.profileImage || null);
    }
  }, [category]);

  const handleUpdate = async () => {
    if (!name || !email || !phone || !role) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("role", role);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      await usersService.update(category.id, formData);
      toast.success("User updated successfully!");
      setEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user.");
    }
  };

  const handleImageChange = ({ file }) => {
    setProfileImage(file.originFileObj);
  };

  return (
    <Modal
      title="Edit User"
      visible={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
    >
      <Form layout="vertical">
        {/* Name */}
        <Form.Item label="Name" required>
          <Input
            placeholder="Enter the user name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Item>

        {/* Email */}
        <Form.Item label="Email Address" required>
          <Input
            type="email"
            placeholder="Enter the email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item label="Phone Number" required>
          <Input
            type="tel"
            placeholder="Enter the phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Form.Item>

        {/* Role */}
        <Form.Item label="Role">
          <Select
            value={role}
            onChange={(value) => setRole(value)}
          >
            {Object.entries(roleOptions).map(([key, { label }]) => (
              <Option key={key} value={key}>{label}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Profile Image */}
        <Form.Item label="Profile Image">
          <Upload
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
          </Upload>
        </Form.Item>

        {/* Footer buttons */}
        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={() => setEditModal(false)} style={{ marginRight: 8 }}>
            Close
          </Button>
          <Button type="primary" onClick={handleUpdate}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;