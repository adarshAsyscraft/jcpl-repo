import React, { Fragment } from "react";
import { Breadcrumbs, H5, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import Users from "./Users";

const Employees = () => {


  return (
    <Fragment>
      <Breadcrumbs mainTitle="Employees" parent="Apps" title="Employees" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Users />
      </Container>
    </Fragment>
  );
};
export default Employees;
