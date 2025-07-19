import React, { Fragment, useContext, useState } from "react";
import { Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { Btn, H4, P, Image, H6 } from "../AbstractElements";
import {  Password, RememberPassword, SignIn } from "../Constant";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { API_URL } from "../Config/AppConstant";
import { setLogin } from "../Redux/slices/auth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import logoWhite from "../assets/images/logo/logo.png";
import logoDark from "../assets/images/logo/logo_dark.png";
import CustomizerContext from "../_helper/Customizer";
import man from "../assets/images/dashboard/profile.png";



const Signin = ({ selected }) => {
  const { layoutURL } = useContext(CustomizerContext);
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);

  const navigate = useNavigate();


  const loginAuth = async (e) => {
    e.preventDefault(); // Prevent form default behavior
    try {
      if (!userName || !password) {
        toast.error("Please enter required fields!");
        return;
      }

      // Replace the URL with your login API endpoint
      const response = await axios.post(`${API_URL}/users/loginUser`, {
        userName,
        password,
      });
      console.log(response);
      const token  = response.data.token;
      console.log(response.data.token);

      dispatch(setLogin({ token }));
      toast.success("Login successful!");
      localStorage.setItem("token", token);
      localStorage.setItem("authenticated", true);
      localStorage.setItem("login", true);
      setTimeout(() => {
        navigate(`${process.env.PUBLIC_URL}/dashboard/default/${layoutURL}`);
      }, 500);
    } catch (error) {
      console.error("Login Error::", error.message);
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };




  return (
    <Fragment>
      <Container fluid className="p-0 login-page">
        <Row>
          <Col xs="12">
            <div className="login-card">
              <div className="login-main login-tab">
                <div>
                  <Link className="logo" to="/">
                    <Image attrImage={{ className: "img-fluid for-light w-25 rounded", src: logoWhite, alt: "login-page" }} />
                    <Image attrImage={{ className: "img-fluid for-dark w-25 rounded", src: logoDark, alt: "login-page" }} />
                  </Link>
                </div>
                <Form className="theme-form" onSubmit={loginAuth}>
                  <H4>{selected === "simpleLogin" ? "" : "Sign In"}</H4>
                  <P>Enter your Username to login</P>
                  <FormGroup>
                    <Label className="col-form-label">userName</Label>
                    <Input type="text" onChange={(e) => setUserName(e.target.value)} value={userName} placeholder="Enter your username" required />
                  </FormGroup>
                  <FormGroup className="position-relative">
                    <Label className="col-form-label">{Password}</Label>
                    <div className="position-relative">
                      <Input type={togglePassword ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" required />
                      <div className="show-hide" onClick={() => setTogglePassword(!togglePassword)}>
                        <span className={togglePassword ? "" : "show"}></span>
                      </div>
                    </div>
                  </FormGroup>
                  <div className="form-group mb-0">
                    <div className="checkbox">
                      <Input id="checkbox1" type="checkbox" />
                      <Label className="text-muted" for="checkbox1">{RememberPassword}</Label>
                    </div>
                    <Btn attrBtn={{ color: "primary", className: "d-block w-100 mt-2", type: "submit" }}>{SignIn}</Btn>
                  </div>
                  <div className="login-social-title">
                    <H6 attrH6={{ className: "text-muted or mt-4" }}>
                      Or Sign up with
                    </H6>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <ToastContainer />
    </Fragment>
  );
};

export default Signin;
