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
import { Breadcrumbs, Btn } from "../../AbstractElements";
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
import { CountryData } from "../../Data/World/Country";
import { StateData } from "../../Data/World/State";
import { CityData } from "../../Data/World/City";
import "../../assets/scss/country.css";
import axios from "axios";
import { API_URL } from "../../Config/AppConstant";
import usersService from "../../Services/users";
import { fetchTrainers } from "../../Redux/slices/trainers";
const { Option } = Select;

const AddTrainer = () => {
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
const [getOTP, setGetOTP] = useState('')
  const [country, setCountry] = useState({
    id: null,
    name: null,
    country_code: null,
  });
  const [currentState, setCurrentState] = useState({
    id: null,
    name: null,
  });
  const [currentCity, setCurrentCity] = useState({
    id: null,
    name: null,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      finalData.status
    );
    if (
      !finalData.first_name ||
      !finalData.last_name ||
      !finalData.phone ||
      !finalData.email ||
      !finalData.gender ||
      //   !finalData.dob?.format("YYYY-MM-DD") ||
      !finalData.status 
    ) {
      toast.error("Please fill in all the required fields.");
      return false;
    }

    const data = {
      preferred_name: finalData.first_name,
      name: finalData.first_name,
      last_name: finalData.last_name,
      phone: finalData.phone,
      email: finalData.email,
      gender: finalData.gender,
      country: country.country_code,
      country: country.name,
      state: currentState.name,
      city: currentCity.name,
      otp: finalData.otp,
      dob: finalData.dob?.format("YYYY-MM-DD"),
      role:"3",
      specialty: finalData.specialty,
      available: finalData.available,
    };

    try {
      await usersService.createTrainer(data);
      toast.success("Trainer created successfully!");
      navigate(`${process.env.PUBLIC_URL}/trainer/${layoutURL}`);
      form.resetFields(); // Reset the form after successful submission
      dispatch(fetchTrainers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create lead.");
    }
  };

  // const fetchGoals = () => {
  //   goalsService
  //     .getAll()
  //     .then((res) => {
  //       if (Array.isArray(res?.data?.data)) {
  //         setGoals(res?.data?.data);
  //       } else {
  //         console.error("Fetched goals data is not an array", res?.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const fetchGyms = () => {
  //   gymsService
  //     .getAll()
  //     .then((res) => {
  //       console.log(res.data);
  //       if (Array.isArray(res?.data)) {
  //         setGyms(res?.data);
  //       } else {
  //         console.error("Fetched goals data is not an array", res?.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const fetchSubscriptionList = () => {
  //   packagesService
  //     .getAll()
  //     .then((res) => {
  //       console.log(res.data);
  //       setPackageData(res?.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // useEffect(() => {
  //   fetchGoals();
  //   fetchGyms();
  //   fetchSubscriptionList();
  // }, []);

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

  const handleSendOTP = async() => {
    const values = await form.getFieldsValue();
    usersService
      .sendOTP({identifier:values.email})
      .then((res) => {
        console.log(res);
        toast.success(res.message)
        setGetOTP(res.otp)
      })
      .catch((error) => {
        console.log(error);
        toast.error(error || "Failed OTP Send!")
      });
  };

  return (
    <Container fluid className="email-wrap bookmark-wrap todo-wrap">
      <Breadcrumbs mainTitle="Trainer" parent="Apps" title="Trainer" />
      <Card>
        <Steps
          size="small"
          current={step - 1}
          items={[
            { title: "Basic Details" },
            { title: "Preferences" },
            { title: "Address" },
            { title: "Verification" },
          ]}
        />
      </Card>
      <Card className="p-4">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {step === 1 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                    rules={[
                      { required: true, message: "First Name is required" },
                    ]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                    rules={[
                      { required: true, message: "Last Name is required" },
                    ]}
                  >
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[{ required: true, message: "Gender is required" }]}
                  >
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
                  <Form.Item
                    label="Date of Birth"
                    name="dob"
                    rules={[
                      { required: true, message: "Date of birth is required" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

              </>
            )}

            {step === 2 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Specialty"
                    name="specialty"
                    rules={[
                      {
                        required: true,
                        message: "Specialty is required",
                      },
                    ]}
                  >
                    <Select placeholder="Select Specialty">
                      <Option value="Wellness Coach">Wellness Coach</Option>
                      <Option value="Body Transformation Coach">
                        Body Transformation Coach
                      </Option>
                      <Option value="Performance Coach">
                        Performance Coach
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: "Status is required" }]}
                  >
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Unactive"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Available"
                    name="available"
                    rules={[
                      {
                        required: true,
                        message: "Specialty is required",
                      },
                    ]}
                  >
                    <Select placeholder="Select availity">
                      <Option value="1">True</Option>
                      <Option value="2">False</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {/* <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "How Heard About Gym is required",
                      },
                    ]}
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
                  <Form.Item
                    label="Packages"
                    name="package"
                    rules={[{ required: true, message: "Package is required" }]}
                  >
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
                </Col> */}
              </>
            )}

            {step === 3 && (
              <>
                {/* <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Gym"
                    name="gym"
                    rules={[{ required: true, message: "Gym is required" }]}
                  >
                    <Select allowClear value={assign} showSearch>
                      {gyms.map((data) => (
                        <Option key={data.id} value={data.id}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col> */}

                  <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Country" name="country" rules={[{ required: true, message: "Country is required" }]}>
                    <Select
                      showSearch
                      placeholder="Select a country"
                      value={country?.id}
                      onChange={(value, option) => {
                        setCountry({
                          id: value,
                          name: option.label,
                          country_code: option.countryCode,
                        });
                      }}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {CountryData?.map((data) => (
                        <Option
                          key={data.id}
                          value={data.id}
                          label={data.name}
                          countryCode={data.phone_code}
                        >
                          <span
                            class="stdropdown-flag"
                            style={{ marginRight: "5px" }}
                          >
                            {" "}
                            {data.emoji}
                          </span>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="State" name="state" rules={[{ required: true, message: "State is required" }]}>
                    <Select
                      showSearch
                      value={currentState?.id}
                      onChange={(value, option) => {
                        setCurrentState({
                          id: value,
                          name: option.label,
                        });
                      }}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {StateData?.filter(
                        (data) => data?.country_id == country?.id
                      ).map((data) => (
                        <Option key={data.id} value={data.id} label={data.name}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="City" name="city" rules={[{ required: true, message: "City is required" }]}>
                    <Select
                      showSearch
                      value={currentCity?.id}
                      onChange={(value, option) => {
                        setCurrentCity({
                          id: value,
                          name: option.label,
                        });
                      }}
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {CityData?.filter(
                        (data) => data?.state_id == currentState?.id
                      ).map((data) => (
                        <Option key={data.id} value={data.id} label={data.name}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </>
            )}

            {step === 4 && (
              <>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label="Phone (Optional)" name="phone">
                    <Input placeholder="Enter Phone Number" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Email is required" }]}
                  >
                    <div className="d-flex">
                    <Input placeholder="Enter Email" />
                    <Btn
                      attrBtn={{
                        color: "success",
                        onClick: handleSendOTP,
                        className:'p-0 w-50'
                      }}
                    >
                      Get OTP
                    </Btn>
                    </div>
                  </Form.Item>
                </Col>
               {getOTP && <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="OTP"
                    name="otp"
                    rules={[{ required: true, message: "OTP is required" }]}
                  >
                    <div className="d-flex">
                    <Input placeholder="Enter OTP" />
                    <Btn
                      attrBtn={{
                        color: "success",
                        className:'p-0 w-50'
                      }}
                    >
                      {getOTP}
                    </Btn>
                    </div>
                  </Form.Item>
                </Col>}


                {/* <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item
                    label="Assigned To"
                    name="assigned_to"
                    rules={[
                      { required: true, message: "Assigned to is required" },
                    ]}
                  >
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
                  <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: "Status is required" }]}
                  >
                    <Switch
                      checkedChildren="Active"
                      unCheckedChildren="Unactive"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Follow Up Status"
                    name="follow_up_status"
                    rules={[
                      {
                        required: true,
                        message: "Follow Up Status is required",
                      },
                    ]}
                  >
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
                  <Form.Item
                    label="Custom Note"
                    name="custom_notes"
                    rules={[
                      { required: true, message: "Custom Note is required" },
                    ]}
                  >
                    <Input.TextArea rows={3} placeholder="Enter Note" />
                  </Form.Item>
                </Col> */}
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
                <Btn
                  attrBtn={{
                    color: "success",
                    onClick: onNext,
                  }}
                >
                  Next
                </Btn>
              ) : (
                // <Button type="primary" onClick={onNext} style={{ marginTop: 16 }}>
                //   Next
                // </Button>
                <Btn
                  attrBtn={{
                    color: "success",
                    onClick: onFinish,
                  }}
                >
                  Submit
                </Btn>
                // <Button
                //   type="primary"
                //   htmlType="submit"
                //   style={{ marginTop: 16 }}
                // >
                //   Submit
                // </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default AddTrainer;
