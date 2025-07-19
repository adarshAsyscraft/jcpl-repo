import React, { useCallback, useContext, useEffect, useState } from "react";
import { Form, Input, Button, Card, Space, message, Select, DatePicker, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAttendance } from "../../Redux/slices/attendance";
import { Breadcrumbs } from "../../AbstractElements";
import CustomizerContext from "../../_helper/Customizer";
import { fetchAllUsers } from "../../Redux/slices/allUserSlice";
import moment from "moment";

const { Option } = Select;

const RequestLeave = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const layoutURL = useContext(CustomizerContext);

  const { users } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    user_id: null,
    user_type: "",
    leave_type_id: null,
    days: null,
    start_date: null,
    end_date: null,
    reason: "",
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Auto-calculate leave days based on start & end dates
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      // Ensure we're working with moment objects
      const start = moment.isMoment(formData.start_date) ? formData.start_date : moment(formData.start_date);
      const end = moment.isMoment(formData.end_date) ? formData.end_date : moment(formData.end_date);

      if (start.isValid() && end.isValid()) {
        const duration = end.diff(start, "days") + 1;
        if (duration > 0) {
          setFormData((prev) => ({ ...prev, days: duration }));
          form.setFieldsValue({ days: duration });
        } else {
          message.error("End date must be after the start date.");
        }
      } else {
        message.error("Invalid date selected.");
      }
    }
  }, [formData.start_date, formData.end_date, form]);

  const onFinish = async (values) => {
    console.log("Form Submitted Values:", values);
    try {
      await dispatch(createAttendance(values)).unwrap();
      message.success("Leave request submitted successfully!");
      setFormData({
        user_id: null,
        user_type: "",
        leave_type_id: null,
        days: null,
        start_date: null,
        end_date: null,
        reason: "",
      });
      form.resetFields();
      navigate(`${process.env.PUBLIC_URL}/attendance/${layoutURL}`);
    } catch (error) {
      message.error("Failed to submit leave request.");
      console.error("Leave request error:", error);
    }
  };

  const handleFormChange = useCallback((eOrValue, optionOrEvent) => {
    let name, value;

    if (optionOrEvent?.target) {
      name = optionOrEvent.target.name;
      value = optionOrEvent.target.value;
    } else {
      name = optionOrEvent.name;
      value = eOrValue;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    form.setFieldsValue({ [name]: value });
  }, [form]);

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Leave Request" parent="Apps" title="Request Leave" />
      <Card
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          padding: "30px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="User"
                name="user_id"
                rules={[{ required: true, message: "User is required" }]}
              >
                <Select
                  placeholder="Select a user"
                  value={formData.user_id}
                  onChange={(value) => handleFormChange(value, { name: "user_id" })}
                  allowClear
                  style={{ width: "100%" }}
                >
                  {users?.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.userName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="User Type"
                name="user_type"
                rules={[{ required: true, message: "User type is required" }]}
              >
                <Input
                  name="user_type"
                  placeholder="Enter User Type (e.g., employee)"
                  value={formData.user_type}
                  onChange={(e) => handleFormChange(null, e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Leave Type"
                name="leave_type_id"
                rules={[{ required: true, message: "Leave type is required" }]}
              >
                <Select
                  placeholder="Select leave type"
                  onChange={(value) => handleFormChange(value, { name: "leave_type_id" })}
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value={1}>Sick Leave</Option>
                  <Option value={2}>Personal Leave</Option>
                  <Option value={3}>Vacation</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Days"
                name="days"
                rules={[{ required: true, message: "Number of days is required" }]}
              >
                <Input
                  type="number"
                  name="days"
                  placeholder="Enter number of leave days"
                  value={formData.days}
                  onChange={(e) => handleFormChange(null, e)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Start Date"
                name="start_date"
                rules={[
                  { required: true, message: "Start date is required" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const date = moment.isMoment(value) ? value : moment(value);
                      return date.isValid() 
                        ? Promise.resolve() 
                        : Promise.reject(new Error('Invalid date'));
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  onChange={(date) => {
                    handleFormChange(date, { name: "start_date" });
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="End Date"
                name="end_date"
                rules={[
                  { required: true, message: "End date is required" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const date = moment.isMoment(value) ? value : moment(value);
                      return date.isValid() 
                        ? Promise.resolve() 
                        : Promise.reject(new Error('Invalid date'));
                    },
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue('start_date')) return Promise.resolve();
                      const startDate = moment.isMoment(getFieldValue('start_date')) 
                        ? getFieldValue('start_date') 
                        : moment(getFieldValue('start_date'));
                      const endDate = moment.isMoment(value) ? value : moment(value);

                      if (!startDate.isValid() || !endDate.isValid()) {
                        return Promise.resolve();
                      }

                      return endDate.isSameOrAfter(startDate)
                        ? Promise.resolve()
                        : Promise.reject(new Error('End date must be after start date'));
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  onChange={(date) => {
                    handleFormChange(date, { name: "end_date" });
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: "Reason is required" }]}
          >
            <Input.TextArea
              name="reason"
              placeholder="Enter reason for leave"
              value={formData.reason}
              onChange={(e) => handleFormChange(null, e)}
              rows={3}
            />
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>
                Submit
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setFormData({
                    user_id: null,
                    user_type: "",
                    leave_type_id: null,
                    days: null,
                    start_date: null,
                    end_date: null,
                    reason: "",
                  });
                }}
                style={{ minWidth: "120px" }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RequestLeave;