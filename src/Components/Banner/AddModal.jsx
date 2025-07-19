import React, { useState } from "react";
import { BASE_URL } from "../../Config/AppConstant";
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

const AddModal = ({ Modaltoggle, currentPage,viewModal }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    status: "active",
    file: null,
  });

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
    const { title, link, file } = formData;
    if (!title || !link || !file) {
      toast.error("Please fill in all the required fields.");
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("link", formData.link);
    data.append("status", formData.status);
    data.append("image", formData.file);

    try {
      await bannersService.create(data);
      toast.success("Banner created successfully!");
      batch(() => {
        dispatch(fetchBanners(currentPage, 10));
        setFormData({
          title: "",
          link: "",
          status: "active",
          file: null,
        })
      });
      Modaltoggle(); // Close the modal after successful operation
    } catch (error) {
      toast.error(error.message || "Failed to add banner.");
    }
  };

  return (
    <Modal isOpen={viewModal} toggle={Modaltoggle} size="md" centered>
      <ModalHeader toggle={Modaltoggle}>Add Banner</ModalHeader>
      <hr />
      <ModalBody>
        <Form>
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

          {/* Upload File */}
          <FormGroup>
            <Label className="col-form-label">Upload File</Label>
            <Col sm="12">
              <Input
                type="file"
                name="file"
                onChange={handleInputChange}
                required
              />
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: "secondary", onClick: Modaltoggle }}>
          Close
        </Btn>
        <Btn attrBtn={{ color: "primary", onClick: handleAddCategory }}>
          Save
        </Btn>
      </ModalFooter>
    </Modal>
  );
};

export default AddModal;
