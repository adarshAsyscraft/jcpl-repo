import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Col,
} from "reactstrap";
import { Btn } from "../../../../AbstractElements";
import { batch, useDispatch } from "react-redux";
import { fetchBanners } from "../../../../Redux/slices/banners";
import { Select, Image } from "antd";
import bannersService from "../../../../Services/banner";
import { toast } from "react-toastify";

const EditModal = ({ category, editModal, setEditModal, EditModaltoggle, currentPage }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    status: "active",
    file: null,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title || "",
        link: category.link || "",
        status: category.status || "active",
        file: null,
      });
    }
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title || !formData.link) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleEditCategory = async () => {
    if (!validateForm()) return;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("link", formData.link);
    data.append("status", formData.status);

    if (formData.file) {
      data.append("image", formData.file);
    }

    try {
      await bannersService.update(category.id, data);
      toast.success("Banner updated successfully!");
      batch(() => {
        dispatch(fetchBanners(currentPage, 10));
      });
      setEditModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to update banner.");
    }
  };

  return (
    <Modal isOpen={editModal} toggle={EditModaltoggle} size="md" centered>
      <ModalHeader toggle={EditModaltoggle}>Edit Banner</ModalHeader>
      <hr />
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Title</Label>
            <Input type="text" name="title" placeholder="Enter banner title" value={formData.title} onChange={handleInputChange} required />
          </FormGroup>

          <FormGroup>
            <Label>Link</Label>
            <Input type="text" name="link" placeholder="Enter banner link" value={formData.link} onChange={handleInputChange} required />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: "secondary", onClick: EditModaltoggle }}>Close</Btn>
        <Btn attrBtn={{ color: "primary", onClick: handleEditCategory }}>Save Changes</Btn>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
