import React, { Fragment, useContext, useState } from "react";
import { Form, FormGroup, Label, Row, Col, Container } from "reactstrap";
import { Btn, H4, P, H6, Image } from "../AbstractElements";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "../assets/images/logo/logo.png";
import logoDark from "../assets/images/logo/logo_dark.png";
import { API_URL } from "../Config/AppConstant";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import CustomizerContext from "../_helper/Customizer";
import { Input, Select } from "antd";
import { CountryData } from "../Data/World/Country";
import { StateData } from "../Data/World/State";
import { CityData } from "../Data/World/City";
import "../assets/scss/country.css";
import { batch, useDispatch } from "react-redux";
import usersService from "../Services/users";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const { Option } = Select;

const TrainerRegister = () => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [togglePassword2, setTogglePassword2] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const dispatch = useDispatch();
  const [country, setCountry] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [genderValue, setGenderValue] = useState("Male");

  const validateForm = () => {
    if (!firstName || !lastName || !phone || !password || !email) {
      toast.error("Please fill in all the required fields.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    console.log("hit")
    e.preventDefault();
    if (!validateForm()) return;



    const data = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password,
      role: "4",
      gender: genderValue,
      country: country?.name || "",
      country_code: country?.country_code ? `+${country.country_code}` : "",
      state: currentState?.name || "",
      city: currentCity?.name || "",
    };

    try {
      await usersService.create(data);
      toast.success("User registered successfully!");
      batch(() => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      });
      setTimeout(() => {
        navigate(`${process.env.PUBLIC_URL}/login`);
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <Fragment>
      <section className="register-section">
        <Container fluid className="p-0">
          <div className="login-card">
            <Row className="m-0">
              <Col xs={12} sm={10} md={8} lg={6}>
                <div className="login-main p-4">
                  <div className="text-center">
                    <Link className="logo" to={process.env.PUBLIC_URL}>
                      <Image
                        attrImage={{
                          className: "img-fluid for-light",
                          src: logoWhite,
                          alt: "logo",
                        }}
                      />
                      <Image
                        attrImage={{
                          className: "img-fluid for-dark",
                          src: logoDark,
                          alt: "logo",
                        }}
                      />
                    </Link>
                  </div>
                  <Form
                    className="theme-form login-form"
                    onSubmit={handleRegister}
                  >
                    <H4 className="text-center">Gym Owner Registration</H4>
                    <P className="text-center">
                      Enter your details to create an account
                    </P>

                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label>First Name</Label>
                          <Input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label>Last Name</Label>
                          <Input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={12}>
                        <FormGroup>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={12}>
                        <FormGroup>
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label>Password</Label>
                          <div className="position-relative">
                            <Input
                              type={togglePassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter password"
                              required
                            />
                            <div
                              className="show-hide"
                              onClick={() => setTogglePassword(!togglePassword)}
                            >
                              {togglePassword ? (
                                <EyeOutlined />
                              ) : (
                                <EyeInvisibleOutlined />
                              )}
                            </div>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label>Confirm Password</Label>
                          <div className="position-relative">
                            <Input
                              type={togglePassword2 ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Confirm password"
                              required
                            />
                            <div
                              className="show-hide"
                              onClick={() =>
                                setTogglePassword2(!togglePassword2)
                              }
                            >
                              {togglePassword2 ? (
                                <EyeOutlined />
                              ) : (
                                <EyeInvisibleOutlined />
                              )}
                            </div>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label className="col-form-label m-0 pt-0">
                            Country
                          </Label>
                          <Select
                            className="w-100"
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
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
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
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label className="col-form-label m-0 pt-0">
                            State
                          </Label>
                          <Select
                            placeholder="Select a state"
                            className="w-100"
                            value={currentState?.id}
                            onChange={(value, option) => {
                              setCurrentState({
                                id: value,
                                name: option.label,
                              });
                            }}
                            filterOption={(input, option) =>
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {StateData?.filter(
                              (data) => data?.country_id == country?.id
                            ).map((data) => (
                              <Option
                                key={data.id}
                                value={data.id}
                                label={data.name}
                              >
                                {data.name}
                              </Option>
                            ))}
                          </Select>
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label className="col-form-label m-0 pt-0">
                            City
                          </Label>
                          <Select
                            className="w-100"
                            showSearch
                            value={currentCity?.id}
                            placeholder="Select a city"
                            onChange={(value, option) => {
                              setCurrentCity({
                                id: value,
                                name: option.label,
                              });
                            }}
                            filterOption={(input, option) =>
                              option.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                          >
                            {CityData?.filter(
                              (data) => data?.state_id == currentState?.id
                            ).map((data) => (
                              <Option
                                key={data.id}
                                value={data.id}
                                label={data.name}
                              >
                                {data.name}
                              </Option>
                            ))}
                          </Select>
                        </FormGroup>
                      </Col>
                      <Col xs={12} md={6}>
                        <FormGroup>
                          <Label className="col-form-label m-0 pt-0">
                            Gender
                          </Label>
                          <Select
                            className="w-100"
                            value={genderValue}
                            onChange={(value) => setGenderValue(value)}
                          >
                            <Option value={"Male"}>Male</Option>
                            <Option value={"Female"}>Female</Option>
                            <Option value={"Non-binary"}>Non-binary</Option>
                            <Option value={"Prefer not to say"}>
                              Prefer not to say
                            </Option>
                          </Select>
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup className="mt-3">
                      <Btn
                        attrBtn={{
                          className: "w-100",
                          color: "primary",
                          type: "submit",
                        }}
                      >
                        Create Account
                      </Btn>
                    </FormGroup>

                    <P className="text-center mt-3">
                      Already have an account?
                      <Link
                        className="ms-2"
                        to={`${process.env.PUBLIC_URL}/login`}
                      >
                        Sign in
                      </Link>
                    </P>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
      <ToastContainer />
    </Fragment>
  );
};

export default TrainerRegister;
