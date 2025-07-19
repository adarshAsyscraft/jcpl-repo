import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Btn } from "../../../../AbstractElements";
import { batch, useDispatch } from "react-redux";
import { Select } from "antd";
import { toast } from "react-toastify";
import zktecoService from "../../../../Services/zkteco";

const { Option } = Select;

const AddModal = ({ Modaltoggle, viewModal, areaData, fetchData }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    area_code: "",
    area_name: "",
    parent_area: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParentAreaChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      parent_area: value || "", // Ensure it's an empty string if cleared
    }));
  };

  const validateForm = () => {
    const { area_code, area_name } = formData;
    if (!area_code || !area_name) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    const data = {area_code: formData.area_code , area_name:formData.area_name , parent_area:formData.parent_area}

    try {
        console.log(data)
      await zktecoService.createArea(data);
      toast.success("Area created successfully!");
      batch(() => {
        fetchData(); // Refresh data
        setFormData({
          area_code: "",
          area_name: "",
          parent_area: "",
        });
      });
      Modaltoggle(); // Close modal
    } catch (error) {
      toast.error(error.message || "Failed to add area.");
    }
  };

  return (
    <Modal isOpen={viewModal} toggle={Modaltoggle} size="md" centered>
      <ModalHeader toggle={Modaltoggle}>Add Area</ModalHeader>
      <hr className="m-0" />
      <ModalBody>
        <Form>
          <FormGroup>
            <Label className="col-form-label pt-0">Area Code</Label>
            <Input
              type="text"
              name="area_code"
              placeholder="Enter area code"
              value={formData.area_code}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label className="col-form-label pt-0">Area Name</Label>
            <Input
              type="text"
              name="area_name"
              placeholder="Enter area name"
              value={formData.area_name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup className="d-flex flex-column">
            <Label className="col-form-label pt-0">
              Parent Area (Optional)
            </Label>
            <Select
              allowClear
              showSearch
              value={formData.parent_area}
              onChange={handleParentAreaChange}
            >
              {areaData.map((data) => (
                <Option key={data.id} value={data.id}>
                  {data.area_name}
                </Option>
              ))}
            </Select>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: "secondary", onClick: Modaltoggle }}>Close</Btn>
        <Btn attrBtn={{ color: "primary", onClick: handleAddCategory }}>
          Save
        </Btn>
      </ModalFooter>
    </Modal>
  );
};

export default AddModal;
