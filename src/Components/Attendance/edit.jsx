import React, { useEffect } from "react";
import {
  Modal,
  Form,
  DatePicker,
  Select,
  Button,
  message,
  Row,
  Col,
} from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import {
  updateAttendance,
  fetchAttendance,
} from "../../Redux/slices/attendance";

const { Option } = Select;

const EditAttendance = ({ editModal, setEditModal, category }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        check_out: moment(category.check_out),
        overtime: !!category.overtime,
        status: category.status,
      });
    }
  }, [category, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        id: category.id,
        check_out: values.check_out.toISOString(),
        overtime: values.overtime,
        status: values.status,
      };

      await dispatch(updateAttendance({ data })).unwrap();
      message.success("Attendance updated successfully");
      setEditModal(false);
      dispatch(fetchAttendance());
    } catch (error) {
      console.error(error);
      message.error("Update failed");
    }
  };

  return (
    <Modal
      title="Edit Attendance"
      open={editModal}
      onCancel={() => setEditModal(false)}
      footer={null}
      centered
      width={700}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Check Out"
              name="check_out"
              rules={[{ required: true, message: "Please select check out time" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Overtime"
              name="overtime"
              rules={[{ required: true, message: "Please select overtime" }]}
            >
              <Select placeholder="Select Overtime">
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select Status">
                <Option value="Present">Present</Option>
                <Option value="Absent">Absent</Option>
                <Option value="Leave">Leave</Option>
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

export default EditAttendance;
