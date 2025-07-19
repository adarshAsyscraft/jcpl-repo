import React, { Fragment, useContext, useState } from "react";
import { Facebook } from "react-feather";
import { Form, FormGroup, Input, Label, Row, Col, Container } from "reactstrap";
import { Btn, H4, P, H6, Image } from "../AbstractElements";
import { Link, useNavigate } from "react-router-dom";
import logoWhite from "../assets/images/logo/logo.png";
import logoDark from "../assets/images/logo/logo_dark.png";
import { API_URL } from "../Config/AppConstant";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import CustomizerContext from "../_helper/Customizer";

const Register = () => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const createAdmin = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!name || !email || !phone || !password) {
        toast.error("Please enter all required fields!");
        return;
      }

      // Send API request to create admin
      await axios
        .post(`${API_URL}/admin/create`, {
          name,
          email,
          phone,
          password,
        })
        .then((res) => {
          console.log(res);
          toast.success("Registered successfully!");
          // Show success toast and redirect to login
          setTimeout(() => {
            navigate(`${process.env.PUBLIC_URL}/login`);
          }, 1000);
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response?.data?.message || "Registration failed!");
        });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
      console.error("Registration Error:", error.response?.data?.message);
    }
  };

  return (
    <Fragment>
      <section>
        <Container fluid className="p-0">
          <Row className="m-0">
            <Col className="p-0">
              <div className="login-card">
                <div className="login-main">
                  <div>
                    <Link className="logo" to={process.env.PUBLIC_URL}>
                      <Image
                        attrImage={{
                          className: "img-fluid for-light",
                          src: logoWhite,
                          alt: "loginpage",
                        }}
                      />
                      <Image
                        attrImage={{
                          className: "img-fluid for-dark",
                          src: logoDark,
                          alt: "loginpage",
                        }}
                      />
                    </Link>
                  </div>
                  <Form
                    className="theme-form login-form"
                    onSubmit={createAdmin}
                  >
                    <H4>Create your account</H4>
                    <P>Enter your personal details to create an account</P>

                    <FormGroup>
                      <Label className="col-form-label m-0 pt-0">
                        Your Name
                      </Label>
                      <Input
                        className="form-control"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label className="col-form-label m-0 pt-0">
                        Email Address
                      </Label>
                      <Input
                        className="form-control"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label className="col-form-label m-0 pt-0">
                        Phone Number
                      </Label>
                      <Input
                        className="form-control"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        required
                      />
                    </FormGroup>

                    <FormGroup className="position-relative">
                      <Label className="col-form-label m-0 pt-0">
                        Password
                      </Label>
                      <div className="position-relative">
                        <Input
                          className="form-control"
                          type={togglePassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                        <div
                          className="show-hide"
                          onClick={() => setTogglePassword(!togglePassword)}
                        >
                          <span className={togglePassword ? "" : "show"}></span>
                        </div>
                      </div>
                    </FormGroup>

                    <FormGroup className="m-0">
                      <div className="checkbox">
                        <Input id="checkbox1" type="checkbox" required />
                        <Label className="text-muted" for="checkbox1">
                          Agree with <span>Privacy Policy</span>
                        </Label>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Btn
                        attrBtn={{
                          className: "d-block w-100",
                          color: "primary",
                          type: "submit",
                        }}
                      >
                        Create Account
                      </Btn>
                    </FormGroup>

                    <div className="login-social-title">
                      <H6 attrH6={{ className: "text-muted or mt-4" }}>
                        Or Sign up with
                      </H6>
                    </div>

                    <div className="social my-4">
                      <div className="btn-showcase">
                        <a
                          className="btn btn-light"
                          style={{ width: "45%" }}
                          href="#"
                          rel="noreferrer"
                          target="_blank"
                        >
                          <img
                            width="17"
                            height="17"
                            src={require("../assets/images/google-logo.png")}
                            alt="Google"
                          />{" "}
                          Google
                        </a>
                      </div>
                    </div>

                    <P attrPara={{ className: "mb-0 text-start" }}>
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
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <ToastContainer />
    </Fragment>
  );
};

export default Register;
