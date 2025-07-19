import React, { Fragment } from "react";
import { Breadcrumbs, H5, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import Users from "./Users";

const Members = () => {


  return (
    <Fragment>
      <Breadcrumbs mainTitle="Members" parent="Apps" title="Members" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Users />
      </Container>
    </Fragment>
  );
};
export default Members;
