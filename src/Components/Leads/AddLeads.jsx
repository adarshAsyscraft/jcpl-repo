import React, { useContext, useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Card,
  Switch,
  Steps,
} from "antd";
import { Breadcrumbs } from "../../AbstractElements";
import { Container } from "reactstrap";
import goalsService from "../../Services/goals";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersNew } from "../../Redux/slices/allUsers";
import gymsService from "../../Services/gyms";
import leadsService from "../../Services/leads";
import { fetchLeads } from "../../Redux/slices/leads";
import { toast } from "react-toastify";
import packagesService from "../../Services/package";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
const { Option } = Select;

const LeadAdd = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [goals, setGoals] = useState([]);
  const [goalsValue, setGoalsValue] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [assign, setAssign] = useState("");
  const [packageData, setPackageData] = useState([]);
  const dispatch = useDispatch();
  const { loading, error, pagination, allUsers } = useSelector(
    (state) => state.allUsers
    );
    const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});  

const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

  //   console.log(allUsers)

  const handleStep = () => {
    setStep(step + 1);
  };

  const fetchUsers = () => {
    dispatch(fetchUsersNew());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onFinish = async () => {
    const values = await form.validateFields();
    const finalData = { ...formData, ...values }; // Merge all steps' data
    console.log("Form Submitted: ", finalData);
    // console.log("Form Submitted2: ", values);
    console.log(
      finalData.first_name,
      finalData.last_name,
      finalData.phone,
      finalData.email,
      finalData.gender,
      finalData.dob?.format("YYYY-MM-DD"),
      goalsValue,
      finalData.gym,
      finalData.package,
      finalData.preferred_gym_timing,
      finalData.how_heard_about_gym,
      finalData.experience,
      finalData.medical_concerns,
      finalData.other_medical_concern,
      finalData.current_fitness_level,
      finalData.previous_gym_experience,
      finalData.previous_gym_reason,
      finalData.status,
      assign,
      finalData.interest_level,
      finalData.custom_notes,
      finalData.follow_up_status
    );
    if (
      !finalData.first_name ||
      !finalData.last_name ||
      !finalData.phone ||
      !finalData.email ||
      !finalData.gender ||
      //   !finalData.dob?.format("YYYY-MM-DD") ||
      !goalsValue ||
      !finalData.gym ||
      !finalData.package ||
      !finalData.preferred_gym_timing ||
      !finalData.how_heard_about_gym ||
      !finalData.experience ||
      !finalData.medical_concerns ||
      !finalData.other_medical_concern ||
      !finalData.current_fitness_level ||
      !finalData.previous_gym_experience ||
      !finalData.previous_gym_reason ||
      !finalData.status ||
      !assign ||
      !finalData.interest_level ||
      !finalData.custom_notes ||
      !finalData.follow_up_status
    ) {
      toast.error("Please fill in all the required fields.");
      return false;
    }

    const data = {
      first_name: finalData.first_name,
      last_name: finalData.last_name,
      phone: finalData.phone,
      email: finalData.email,
      gender: finalData.gender,
      dob: finalData.dob?.format("YYYY-MM-DD"),
      goal_ids: goalsValue,
      gym_id: finalData.gym,
      //package_id
      package_id: finalData.package,
      preferred_gym_timing: finalData.preferred_gym_timing,
      how_heard_about_gym: finalData.how_heard_about_gym,
      experience: finalData.experience,
      medical_concerns: finalData.medical_concerns,
      other_medical_concern: finalData.other_medical_concern,
      current_fitness_level: finalData.current_fitness_level,
      //previous_gym_experience
      previous_gym_experience:
        finalData.previous_gym_experience === true ? "Yes" : "No",
      previous_gym_reason: finalData.previous_gym_reason,
      // status
      status: finalData.status === true ? "Active" : "Inactive", // Assigned User
      assigned_to: finalData.assigned_to, // Assigned User
      interest_level: finalData.interest_level,
      custom_notes: finalData.custom_notes,
      follow_up_status: finalData.follow_up_status,
    };

    try {
      await leadsService.create(data);
      toast.success("Lead created successfully!");
      navigate(`${process.env.PUBLIC_URL}/leads/${layoutURL}`);
      form.resetFields(); // Reset the form after successful submission
      dispatch(fetchLeads());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create lead.");
    }
  };

  const fetchGoals = () => {
    goalsService
      .getAll()
      .then((res) => {
        if (Array.isArray(res?.data?.data)) {
          setGoals(res?.data?.data);
        } else {
          console.error("Fetched goals data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchGyms = () => {
    gymsService
      .getAll()
      .then((res) => {
        console.log(res.data);
        if (Array.isArray(res?.data)) {
          setGyms(res?.data);
        } else {
          console.error("Fetched goals data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchSubscriptionList = () => {
    packagesService
      .getAll()
      .then((res) => {
        console.log(res.data);
        setPackageData(res?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchGoals();
    fetchGyms();
    fetchSubscriptionList();
  }, []);


  const onNext = async () => {
    try {
        const values = await form.validateFields(); // Get current step values
        setFormData((prev) => ({ ...prev, ...values })); // Merge previous & new values
        setStep(step + 1); // Move to next step
    } catch (error) {
        console.log("Validation failed:", error);
    }
};
  

  const onPrevious = () => {
    setStep(step - 1);
  };

  return (
    <Container fluid className="email-wrap bookmark-wrap todo-wrap">
      <Breadcrumbs mainTitle="Leads" parent="Apps" title="Leads" />
      <Card>
        <Steps
          size="small"
          current={step - 1}
          items={[
            { title: "Basic Details" },
            { title: "Preferences" },
            { title: "Experience" },
            { title: "Status" },
          ]}
        />
      </Card>
      <Card className="p-4">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            {step === 1 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[{ required: true, message: "First Name is required" }]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Last Name" name="last_name" rules={[{ required: true, message: "Last Name is required" }]}>
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: "Phone is required" }]}
                  >
                    <Input placeholder="Enter Phone Number" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Email" name="email" rules={[{ required: true, message: "Email is required" }]}>
                    <Input placeholder="Enter Email" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Gender" name="gender" rules={[{ required: true, message: "Gender is required" }]}>
                    <Select placeholder="Select Gender">
                      <Option value={"Male"}>Male</Option>
                      <Option value={"Female"}>Female</Option>
                      <Option value={"Non-binary"}>Non-binary</Option>
                      <Option value={"Prefer not to say"}>
                        Prefer not to say
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Date of Birth" name="dob" rules={[{ required: true, message: "Date of birth is required" }]}>
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </>
            )}

            {step === 2 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Goals" required>
                    <Select
                      mode="multiple"
                      allowClear
                      value={goalsValue}
                      onChange={(value) => setGoalsValue(value)} 
                      rules={[{ required: true, message: "Goals is required" }]}
                    >
                      {goals.map((data) => (
                        <Option key={data.id} value={data.id}>
                          {data.goal_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Preferred Gym Timing"
                    name="preferred_gym_timing"
                    rules={[{ required: true, message: "Preferred Gym Timing is required" }]}
                    >
                    <Select placeholder="Select Timing">
                      <Option value="Morning">Morning</Option>
                      <Option value="Evening">Evening</Option>
                      <Option value="Flexible">Flexible</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    rules={[{ required: true, message: "How Heard About Gym is required" }]}
                    label="How Heard About Gym"
                    name="how_heard_about_gym"
                  >
                    <Select placeholder="Select Option">
                      <Option value="Social Media">Social Media</Option>
                      <Option value="Word of Mouth">Word of Mouth</Option>
                      <Option value="Walk-in">Walk-in</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Packages" name="package" rules={[{ required: true, message: "Package is required" }]}>
                    <Select allowClear showSearch>
                      {packageData.map((data) => (
                        <Option key={data.id} value={data.id}>
                          {`${data.title} (${
                            data.duration
                          } Month) -₹${Math.round(data.price)}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}

            {step === 3 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Current Fitness Level"
                    name="current_fitness_level"
                  >
                    <Select placeholder="Select Option">
                      <Option value="Beginner">Beginner</Option>
                      <Option value="Intermediate">Intermediate</Option>
                      <Option value="Advanced">Advanced</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Medical Concerns" name="medical_concerns" rules={[{ required: true, message: "Medical Concerns is required" }]}>
                    <Select placeholder="Select Option">
                      <Option value="Diabetes">Diabetes</Option>
                      <Option value="Hypertension">Hypertension</Option>
                      <Option value="Asthma">Asthma</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Interest Level" name="interest_level" rules={[{ required: true, message: "Interest Level is required" }]}>
                    <Select placeholder="Select Option">
                      <Option value="Hot">Hot</Option>
                      <Option value="Warm">Warm</Option>
                      <Option value="Cold">Cold</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Gym" name="gym" rules={[{ required: true, message: "Gym is required" }]}>
                    <Select allowClear value={assign} showSearch>
                      {gyms.map((data) => (
                        <Option key={data.id} value={data.id}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Other Medical Concern"
                    name="other_medical_concern"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter Medical Concern"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Previous Gym Reason"
                    name="previous_gym_reason"
                    rules={[{ required: true, message: "Previous Gym Reason is required" }]}
                  >
                    <Input.TextArea rows={3} placeholder="Enter Reason" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Experience" name="experience" rules={[{ required: true, message: "Experience is required" }]}>
                    <Input.TextArea rows={3} placeholder="Enter Experience" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={12}>
                  <Form.Item
                    label="Previous Gym Experience"
                    name="previous_gym_experience"
                    rules={[{ required: true, message: "Previous Gym Experience is required" }]}
                  >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  </Form.Item>
                </Col>
              </>
            )}

            {step === 4 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Assigned To" name="assigned_to" rules={[{ required: true, message: "Assigned to is required" }]}>
                    <Select
                      allowClear
                      value={assign}
                      onChange={(value) => setAssign(value)}
                    >
                      {allUsers.map((data) => (
                        <Option key={data.id} value={data.id}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>{" "}
                <Col xs={24} sm={12} md={8} lg={12}>
                  <Form.Item label="Status" name="status" rules={[{ required: true, message: "Status is required" }]}>
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Unactive"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Follow Up Status" name="follow_up_status" rules={[{ required: true, message: "Follow Up Status is required" }]}>
                    <Select placeholder="Select Option">
                      <Option value="New Inquiry">New Inquiry</Option>
                      <Option value="Engaged">Engaged</Option>
                      <Option value="Disenaged">Disenaged</Option>
                      <Option value="Ready to Sign Up">Ready to Sign Up</Option>
                      <Option value="Converted">Converted</Option>
                      <Option value="Archived">Archived</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Custom Note" name="custom_notes" rules={[{ required: true, message: "Custom Note is required" }]}>
                    <Input.TextArea rows={3} placeholder="Enter Note" />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Row justify="space-between">
            <Col>
              {step > 1 && (
                <Button onClick={onPrevious} style={{ marginTop: 16 }}>
                  Previous
                </Button>
              )}
            </Col>
            <Col>
              {step < 4 ? (
                <Button type="primary" onClick={onNext} style={{ marginTop: 16 }}>
                  Next
                </Button>
              ) : (
                <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                  Submit
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default LeadAdd;
