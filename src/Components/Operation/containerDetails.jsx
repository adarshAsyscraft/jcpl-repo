import React, { useEffect } from "react";
import moment from "moment";
import { DatePicker, Input, Select } from "antd";
import { Label, Row, Col } from "reactstrap";
import { fetchContainerTypes } from "../../Redux/slices/containerTypesSlice";
import { useDispatch, useSelector } from "react-redux";

const { TextArea } = Input;
const { Option } = Select;

const ContainerDetailsSection = ({
  formData,
  handleChange,
  forwarders,
  forwardersLoading,
  fetchedContainer,
  disabled = false,
}) => {
  const { data } = useSelector((state) => state.containerTypes);
  const dispatch = useDispatch();
  const handleMfdChange = (value) => {
    let formatted = "";

    if (!value) {
      formatted = "";
    } else if (moment.isMoment(value) || value instanceof Date) {
      formatted = moment(value).format("MM-YYYY");
    } else if (typeof value === "string") {
      const parsed = moment(value, ["YYYY-MM-DD", "MM-YYYY", "MMYYYY"], true);
      if (parsed.isValid()) {
        formatted = parsed.format("MM-YYYY");
      } else {
        const cleaned = value.replace(/\D/g, "").slice(0, 6);
        if (cleaned.length > 2) {
          formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        } else {
          formatted = cleaned;
        }
      }
    }

    handleChange("mfdDate", formatted);
  };

  useEffect(() => {
    dispatch(fetchContainerTypes());
  }, [dispatch]);

  useEffect(() => {
    if (fetchedContainer?.mfdDate) {
      const formatted = moment(fetchedContainer.mfdDate, "YYYY-MM").isValid()
        ? moment(fetchedContainer.mfdDate, "YYYY-MM").format("MM-YYYY")
        : fetchedContainer.mfdDate;

      handleChange("mfdDate", formatted);
    }
  }, [fetchedContainer]);

  return (
    <div className="shadow-sm p-4 mt-4">
      <h5 className="mb-3">Container Details</h5>
      <Row className="mb-3">
        <Col md="6">
          <Label className="large mb-1">Container Number</Label>
          <Input
            disabled
            value={formData.containerNumber}
            placeholder="Container Number"
          />
        </Col>
        <Col md="6">
          <Label className="large mb-1">Shipping Line</Label>
          <Select
            style={{ width: "100%" }}
            value={
              formData.shippingLineId
                ? String(formData.shippingLineId)
                : undefined
            }
            onChange={(value) => handleChange("shippingLineId", value)}
            placeholder="Select Shipping Line"
            loading={forwardersLoading}
            disabled={disabled}
            size="middle"
          >
            {forwarders
              .filter((res) => res.category === "shipping")
              .map((fwd) => (
                <Option key={fwd.id} value={String(fwd.id)}>
                  {fwd.name}
                </Option>
              ))}
          </Select>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="6">
          <Label className="large mb-1">Container Size</Label>
          <Select
            style={{ width: "100%" }}
            value={formData.size}
            onChange={(value) => handleChange("size", value)}
            placeholder="Select Size"
            disabled={disabled}
          >
            <Option value="20">20</Option>
            <Option value="40">40</Option>
          </Select>
        </Col>

        <Col md="6">
          <Label className="large mb-1">Container Type</Label>
          <Select
            style={{ width: "100%" }}
            value={formData.type}
            onChange={(value) => handleChange("type", value)}
            disabled={disabled}
          >
            <Option>Select Conatiner Types</Option>
            {data &&
              data.map((item) => {
                return (
                  <Option key={item.id} value={item.id}>
                    {item.code}
                  </Option>
                );
              })}
          </Select>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="6">
          <Label className="large mb-1">Tare Weight</Label>
          <Input
            value={formData.tareWeight}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,4}$/.test(value)) {
                handleChange("tareWeight", value);
              }
            }}
            placeholder="Tare Weight"
            disabled={disabled}
          />
        </Col>
        <Col md="6">
          <Label className="large mb-1">MG Weight</Label>
          <Input
            value={formData.mgWeight}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,5}$/.test(value)) {
                handleChange("mgWeight", value);
              }
            }}
            placeholder="MG Weight"
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="6">
          <Label className="large mb-1">MFD Date</Label>
          {/* <Input
            name="mfdDate"
            type="text"
            placeholder="MM-YYYY"
            className="form-control"
            value={formData.mfdDate}
            onChange={(e) => handleMfdChange(e.target.value)}
            disabled={disabled}
          /> */}
          <Input
            name="mfdDate"
            type="text"
            placeholder="MM-YYYY"
            className="form-control"
            value={
              formData.mfdDate
                ? moment(
                    formData.mfdDate,
                    ["MM-YYYY", "YYYY-MM", "MMYYYY", "YYYYMM"],
                    true
                  ).isValid()
                  ? moment(
                      formData.mfdDate,
                      ["MM-YYYY", "YYYY-MM", "MMYYYY", "YYYYMM"],
                      true
                    ).format("MM-YYYY")
                  : formData.mfdDate
                : ""
            }
            onChange={(e) => handleMfdChange(e.target.value)}
            disabled={disabled}
          />
        </Col>

        <Col md="6">
          <Label className="large mb-1">ACEP</Label>
          {/* <DatePicker
            id="acepDate"
            className="form-control"
            value={formData.cscValidity ? moment(formData.cscValidity) : null}
            onChange={handleAcepChange}
            format="MM/DD/YYYY HH:mm"
            showTime={{ format: "HH:mm" }}
            disabled={disabled}
            style={{ width: "100%" }}
          /> */}

          <Input
            name="mfdDate"
            type="text"
            placeholder="MM-YYYY"
            className="form-control"
            value={formData.cscValidity}
            onChange={(e) => handleChange("cscValidity", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md="6">
          <Label className="large mb-1">Remarks</Label>
          <TextArea
            rows={2}
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            placeholder="Remarks"
            disabled={disabled}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ContainerDetailsSection;
