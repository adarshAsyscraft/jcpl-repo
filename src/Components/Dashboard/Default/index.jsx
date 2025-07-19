import React, { Fragment, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import { Breadcrumbs, H5 } from "../../../AbstractElements";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdmin } from "../../../Redux/slices/auth";
import Admin from "./Admin";
import SuperAdmin from "./SuperAdmin";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAdmin());
  }, []);

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Default" parent="Dashboard" title="Default" />
      <Container fluid={true}>
        {user?.role === 3 ? (
          <Admin />
        ) : user?.role === 1 ? (
          <SuperAdmin />
        ) : (
          ""
        )}
      </Container>
    </Fragment>
  );
};

export default Dashboard;
