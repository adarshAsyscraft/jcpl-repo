import React, { useContext } from "react";
import { Form, Input, Select, Button, Card, Row, Col, Space, message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../../../AbstractElements";
import { createUser } from "../../../Redux/slices/allUserSlice";
import CustomizerContext from "../../../_helper/Customizer";


const { Option } = Select;

const AddYard = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const layoutURL = useContext(CustomizerContext)

  const userPermissions = {
    1: ["view", "edit", "create", "search", "delete"],
    2: ["view", "search", "create"],
    3: [],
    4: [],
    5: [],
  };

  const handleUserTypeChange = (value) => {
    const permissions = userPermissions[value] || [];
    form.setFieldsValue({ permissions });
  };

  const onFinish = async (values) => {
    try {
      const userData = {
        userName: values.userName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobileNumber: values.mobileNumber,
        status: values.status,
        password: values.password,
        typeOfUser: values.typeOfUser,
        designation: values.designation,
        permissions: values.permissions || [],
      };
      console.log(userData, "This is userData")
      await dispatch(createUser(userData)).unwrap();
      message.success("User created successfully!");
      form.resetFields();
      navigate(`${process.env.PUBLIC_URL}/dashboard/users/${layoutURL}`)
    } catch (error) {
      message.error("Failed to create user. Please try again.");
      console.error("User creation error:", error);
    }
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Breadcrumbs mainTitle="Users" parent="Apps" title="Add User" />
      <Card
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Username" name="userName" rules={[{ required: true, message: "Username is required" }]}> 
                <Input placeholder="Enter Username" /> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}> 
                <Input placeholder="Enter Email" /> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "First Name is required" }]}> 
                <Input placeholder="Enter First Name" /> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Last Name is required" }]}> 
                <Input placeholder="Enter Last Name" /> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mobile Number" name="mobileNumber" rules={[{ required: true, message: "Mobile Number is required" }]}> 
                <Input placeholder="Enter Mobile Number" /> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Password" name="password" rules={[{ required: true, message: "Password is required" }]}> 
                <Input.Password placeholder="Enter Password" /> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Designation" name="designation" rules={[{ required: true, message: "Designation is required" }]}> 
                <Input placeholder="Enter Designation" /> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" name="status" rules={[{ required: true, message: "Status is required" }]}> 
                <Select placeholder="Select Status"> 
                  <Option value="1">Active</Option> 
                  <Option value="0">Inactive</Option> 
                </Select> 
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Type of User" name="typeOfUser" rules={[{ required: true, message: "Type of User is required" }]}> 
                <Select placeholder="Select User Type" onChange={handleUserTypeChange}> 
                  <Option value={1}>Admin</Option> 
                  <Option value={2}>Sub Admin</Option> 
                  <Option value={3}>Field Operator</Option> 
                  <Option value={4}>Operator</Option> 
                  <Option value={5}>Client</Option> 
                </Select> 
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Permissions" name="permissions" rules={[{ required: true, message: "Permissions are required" }]}> 
                <Select mode="multiple" placeholder="Select Permissions" disabled> 
                  <Option value="create">Create</Option> 
                  <Option value="view">View</Option> 
                  <Option value="edit">Edit</Option> 
                  <Option value="search">Search</Option> 
                  <Option value="delete">Delete</Option> 
                </Select> 
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Space>
              <Button type="primary" htmlType="submit" style={{ minWidth: "120px" }}>Submit</Button>
              <Button onClick={() => form.resetFields()} style={{ minWidth: "120px", background: "#f5f5f5" }}>Reset</Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddYard;
