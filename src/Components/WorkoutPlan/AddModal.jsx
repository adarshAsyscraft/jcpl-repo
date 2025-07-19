import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Row, Col } from "antd";
import { batch, useDispatch } from "react-redux";
import { fetchUsersNew } from "../../Redux/slices/allUsers";
import { toast } from "react-toastify";
import usersService from "../../Services/users";
import goalsService from "../../Services/goals";
import activityService from "../../Services/activity";
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from "react-country-state-city";
// import "react-country-state-city/dist/react-country-state-city.css";
import { CountryData } from "../../Data/World/Country";
import { StateData } from "../../Data/World/State";
import { CityData } from "../../Data/World/City";
import "../../assets/scss/country.css"

const { Option } = Select;

const AddModal = ({ Modaltoggle, currentPage, viewModal }) => {
  const dispatch = useDispatch();
  const [togglePassword, setTogglePassword] = useState(false);
  const [country, setCountry] = useState({
    id: null,
    name: null,
    country_code: null,
  });
  const [currentState, setCurrentState] = useState({
    id: null,
    name: null
  });
  const [currentCity, setCurrentCity] = useState({
    id: null,
    name: null
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    goals: [],
    activity_level_id: "",
    gender: "",
    county: "",
    county_code: "",
    city: "",
    height: "",
    height_in: "cm",
    weight: "",
    weight_in: "kg",
    status: "",
    role: "2",
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(1);
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [goalsValue, setGoalsValue] = useState([]);
  const [activityValue, setActivityValue] = useState("");
  const [heightInValue, setHeightInValue] = useState("cm");
  const [weightInValue, setWeightInValue] = useState("kg");
  const [genderValue, setGenderValue] = useState("Male");
  const [userRole, setUserRole] = useState("2");
  const [role] = useState("2"); // Default role

  const validateForm = () => {
    if (!name || !phone || !password || !email) {
      toast.error("Please fill in all the required fields.");
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    const data = {
      name,
      email,
      phone,
      password,
      role: userRole,
      gender: genderValue,
      status,
      goal_ids: goalsValue,
      activity_level_id: activityValue,
      country: country?.name,
      country_code: `+${country?.country_code}`,
      state: currentState?.name,
      city: currentCity?.name,
      height: userData.height,
      height_in: heightInValue,
      weight: userData.weight,
      weight_in: weightInValue,
    };
    // console.log(data)
    // return
    try {
      await usersService.create(data);
      toast.success("User created successfully!");
      Modaltoggle();
      batch(() => {
        dispatch(fetchUsersNew(currentPage, 10));
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setStatus(1);
        setGoals([]);
        setActivity([]);
      });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user.");
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

  const fetchActivity = () => {
    activityService
      .getAll()
      .then((res) => {
        if (Array.isArray(res?.data?.data)) {
          setActivity(res?.data?.data);
        } else {
          console.error("Fetched activity data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchGoals();
    fetchActivity();
  }, []);



  return (
    <Modal
      title="Add Plan"
      open={viewModal}
      onCancel={Modaltoggle}
      footer={null}
      centered
    >
      <hr />
      <Form layout="vertical">
        {/* Name */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Name" required>
              <Input
                placeholder="Enter the user name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Item>
          </Col>
          {/* Email */}
          <Col span={12}>
            <Form.Item label="Email Address" required>
              <Input
                type="email"
                placeholder="Enter the email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
          </Col>
          {/* Phone */}
          <Col span={12}>
            <Form.Item label="Phone Number" required>
              <Input
                type="tel"
                placeholder="Enter the phone number"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Item>
          </Col>
          {/* Password */}
          <Col span={12}>
            <Form.Item label="Password" required>
              <div style={{ position: "relative" }}>
                <Input.Password
                  type={togglePassword ? "text" : "password"}
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  visibilityToggle
                />
              </div>
            </Form.Item>
          </Col>
          {/* Goals */}
          <Col span={12}>
            <Form.Item label="Goals" required>
              <Select
                mode="multiple"
                allowClear
                value={goalsValue}
                onChange={(value) => setGoalsValue(value)}
              >
                {goals.map((data) => (
                  <Option key={data.id} value={data.id}>
                    {data.goal_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* Activity Level */}
          <Col span={12}>
            <Form.Item label="Activity Level" required>
              <Select
                value={activityValue}
                onChange={(value) => setActivityValue(value)}
              >
                {activity?.map((data) => (
                  <Option key={data.id} value={data.id}>
                    {data.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Status */}
          <Col span={12}>
            <Form.Item label="Status" required>
              <Select value={status} onChange={(value) => setStatus(value)}>
                <Option value={1}>Active</Option>
                <Option value={2}>Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          {/* Country */}
          <Col span={12}>
            <Form.Item label="Country" required>
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
                  ><span class="stdropdown-flag" style={{marginRight:"5px"}}>{" "}{data.emoji}</span>
                    {data.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* State */}
          <Col span={12}>
            <Form.Item label="State" required>
              <Select
                showSearch
                value={currentState?.id}
                onChange={(value, option) => {
                  setCurrentState({
                    id: value,
                    name: option.label
                  });
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              >
                {StateData?.filter((data)=> data?.country_id == country?.id).map(
                  (data) => (
                    <Option key={data.id} value={data.id} label={data.name}>
                      {data.name}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
          </Col>
          {/* City */}

          <Col span={12}>
            <Form.Item label="City" required>
              <Select
                showSearch
                value={currentCity?.id}
                onChange={(value, option) => {
                  setCurrentCity({
                    id: value,
                    name: option.label
                  });
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              >
                {CityData?.filter((data)=> data?.state_id == currentState?.id).map(
                  (data) => (
                    <Option key={data.id} value={data.id} label={data.name}>
                      {data.name}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
          </Col>
          {/* Height */}
          <Col span={12}>
            <Form.Item label="Height" required>
              <Input
                value={userData.height}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, height: e.target.value }))
                }
                addonAfter={
                  <Select
                    value={heightInValue}
                    onChange={(value) => setHeightInValue(value)}
                  >
                    <Option value="cm">cm</Option>
                    <Option value="ft">ft</Option>
                  </Select>
                }
              />
            </Form.Item>
          </Col>
          {/* Weight */}
          <Col span={12}>
            <Form.Item label="Weight" required>
              <Input
                value={userData.weight}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, weight: e.target.value }))
                }
                addonAfter={
                  <Select
                    value={weightInValue}
                    onChange={(value) => setWeightInValue(value)}
                  >
                    <Option value="kg">kg</Option>
                    <Option value="lbs">lbs</Option>
                  </Select>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Gender */}
            <Form.Item label="Gender" required>
              <Select
                value={genderValue}
                onChange={(value) => setGenderValue(value)}
              >
                <Option value={"Male"}>Male</Option>
                <Option value={"Female"}>Female</Option>
                <Option value={"Non-binary"}>Non-binary</Option>
                <Option value={"Prefer not to say"}>Prefer not to say</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Role */}
            <Form.Item label="Role" required>
              <Select value={userRole} onChange={(value) => setUserRole(value)}>
                <Option value={"2"}>User</Option>
                <Option value={"3"}>Gym Owner</Option>
                <Option value={"4"}>Trainer</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Footer buttons */}
        <Form.Item style={{ textAlign: "right" }}>
          <Button onClick={Modaltoggle} style={{ marginRight: 8 }}>
            Close
          </Button>
          <Button type="primary" onClick={handleAddCategory}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModal;
