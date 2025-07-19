import React, { useState, useEffect, Fragment, useContext } from "react";
import { useDispatch, useSelector, batch } from "react-redux";
import { toast } from "react-toastify";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Label,
  Row,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import HeaderCard from "../Common/Component/HeaderCard";
import SmallWidgets from "../Common/CommonWidgets/SmallWidgets";
import { DatePicker, Select } from "antd";
import ReEngagementTable from "./Tables/ReEngagementTable";
import ConfigDB from "../../Config/ThemeConfig";
import MemberAttendanceTable from "./Tables/MemberAttendanceTable";
import StaffAttendanceTable from "./Tables/StaffAttendanceTable";
import Leave from ".";

const Attendance = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();

  const primary =
    localStorage.getItem("default_color") || ConfigDB.data.color.primary_color;
  const secondary =
    localStorage.getItem("secondary_color") ||
    ConfigDB.data.color.secondary_color;

  const data = {
    title: "Gross Profit",
    color: "success",
    total: 3_908,
    gros: 80,
    prefix: "$",
    icon: "profit",
  };

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  



  return (
    <Fragment>
      <Breadcrumbs mainTitle="Leave" parent="Apps" title="Leave" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          <Col xs="12" md="6">
            {/* <Card>
              <HeaderCard
              title={"Today Member Check-In"}
                mainClasses={
                  "d-flex justify-content-between align-items-center pt-2 pb-2 border-0"
                }
                span1={
                  <div className="d-flex flex-column">
                    <DatePicker picker="month" format={"MM-YYYY"} />
                  </div>
                }
              /> */}

              <SmallWidgets
                mainClass={"mb-0"}
                data={{
                  title: "Today Member Check-In",
                  color: "warning",
                  total: 3_908,
                  // gros: 80,
                  // prefix: "₹",
                  icon: "customers",
                }}
              />
            {/* </Card/> */}
          </Col>
          <Col xs="12" md="6">
            {/* <Card>
              <HeaderCard
                // title={"Today Staff Check-In"}
                mainClasses={
                  "d-flex justify-content-between align-items-center pt-2 pb-2 border-0"
                } 
                 span1={
                 <div className="d-flex flex-column">
                   <DatePicker picker="month" format={"MM-YYYY"} />
                 </div>
                 
              />*/}
              <SmallWidgets
              mainClass={"mb-0"}
                data={{
                  title: "Today New Customers",
                  color: "secondary",
                  total: 2_908,
                  // gros: 20,
                  icon: "customers",
                }}
              />
            {/* </Card> */}
          </Col>
          <Leave/>
          {/* <ReEngagementTable/> */}
          {/* <MemberAttendanceTable/> */}
          {/* <StaffAttendanceTable/> */}
        </Row>
      </Container>
    </Fragment>
  );
};

export default Attendance;