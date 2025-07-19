import React, { Fragment, useContext, useState, useEffect } from "react";
import { Breadcrumbs } from "../../AbstractElements";
import { Col, Container, Row } from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import CourseBox from "../Common/CommonWidgets/CourseBox";
import UpcomingSchedule from "./UpcomingSchedule";
import trainersService from "../../Services/trainer";
import ComplatedSchedule from "./ComplatedSchedule";

const PTSchedule = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [upcomingData, setUpcomingData] = useState([]);
  const [completedData, setCompletedData] = useState([]);

  const fetchData = (page) => {
    trainersService.getAllBookings({
      page,
      limit: pageSize,
      type: "upcoming",
    })
      .then((res) => {
        setUpcomingData(res?.data?.bookings || []);
      })
      .catch((error) => {
        console.log(error);
      });

    trainersService.getAllBookings({
      page,
      limit: pageSize,
      type: "completed",
    })
      .then((res) => {
        setCompletedData(res?.data?.bookings || []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, pageSize]);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const ScheduleData = [
    {
      title: "Upcoming",
      course: `${upcomingData.length}`,
      icon: "course-1",
    },
    {
      title: "Completed",
      course: `${completedData.length}`,
      icon: "course-2",
      color: "warning",
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs mainTitle="PT Schedule" parent="Apps" title="PT Schedule" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          {ScheduleData.map((item, i) => (
            <Col sm="6" key={i}>
              <CourseBox data={item} />
            </Col>
          ))}
          <Col sm="12" md="6">
            <UpcomingSchedule 
              data={upcomingData} 
              currentPage={currentPage} 
              pageSize={pageSize} 
              onPageChange={handlePaginationChange} 
            />
          </Col>
          <Col sm="12" md="6">
            <ComplatedSchedule 
              data={completedData} 
              currentPage={currentPage} 
              pageSize={pageSize} 
              onPageChange={handlePaginationChange} 
            />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default PTSchedule;
