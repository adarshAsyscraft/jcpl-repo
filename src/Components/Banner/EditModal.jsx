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
import { Btn } from "../../AbstractElements";
import { batch, useDispatch } from "react-redux";
import { fetchBanners } from "../../Redux/slices/banners";
import { Select } from "antd";
import bannersService from "../../Services/banner";
import { toast } from "react-toastify";
import { BASE_URL } from "../../Config/AppConstant";
import {Image}  from 'antd'

const EditModal = ({ category, editModal, setEditModal, EditModaltoggle, currentPage }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    status: "active",
    file: null, // File is optional when editing
  });

  // Populate form data with existing category data on modal open
  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title || "",
        link: category.link || "",
        status: category.status || "active",
        file: null, // Reset file input
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
    const { title, link } = formData;
    if (!title || !link) {
      toast.error("Please fill in all the required fields.");
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

    // Append file only if a new one is selected
    if (formData.file) {
      data.append("image", formData.file);
    }

    try {
      await bannersService.update(category.id, data); // Assuming `category.id` is the identifier
      toast.success("Banner updated successfully!");
      batch(() => {
        dispatch(fetchBanners(currentPage, 10));
      });
      setEditModal(false); // Close the modal after successful update
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
          {/* Title */}
          <FormGroup>
            <Label className="col-form-label pt-0">Title</Label>
            <Input
              type="text"
              name="title"
              placeholder="Enter banner title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          {/* Link */}
          <FormGroup>
            <Label className="col-form-label pt-0">Link</Label>
            <Input
              type="text"
              name="link"
              placeholder="Enter banner link"
              value={formData.link}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          {/* Status */}
          <FormGroup>
            <Label className="col-form-label pt-0">Status</Label>
            <Col sm="12">
              <Select
                value={formData.status}
                style={{ width: "100%" }}
                onChange={handleStatusChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "deactive", label: "Deactive" },
                ]}
              />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col sm="12">
            <Image
            width={60}
            height={60}
            src={`${BASE_URL}/${category.image}`}
            placeholder
            style={{ borderRadius: 4, objectFit: "cover" }}
          />
            </Col>
          </FormGroup>

          {/* Upload File */}
          <FormGroup>
            <Label className="col-form-label">Upload File (optional)</Label>
            <Col sm="12">
              <Input
                type="file"
                name="file"
                onChange={handleInputChange}
              />
              <small className="form-text text-muted">
                Leave this empty if you don't want to change the image.
              </small>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: "secondary", onClick: EditModaltoggle }}>
          Close
        </Btn>
        <Btn attrBtn={{ color: "primary", onClick: handleEditCategory }}>
          Save Changes
        </Btn>
      </ModalFooter>
    </Modal>
  );
};

export default EditModal;
