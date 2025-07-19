import React, { Fragment, useContext } from "react";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import {
  Container,
  Row,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import TrainerWorkoutPlan from "./TrainerWorkoutPlan";

const WorkoutPlan = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();


  return (
    <Fragment>
      <Breadcrumbs mainTitle="Workout Plan" parent="Apps" title="workout" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          <TrainerWorkoutPlan/>
        </Row>
      </Container>
    </Fragment>
  );
};

export default WorkoutPlan