import React, { Fragment, useState, useEffect } from "react";
import {
  Accordion,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
} from "reactstrap";
import { Tag, Button, Space, Table, Select } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import HeaderCard from "../Common/Component/HeaderCard";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import trainersService from "../../Services/trainer";
import { Btn, H5 } from "../../AbstractElements";
import AddModal from "./AddModal";

const TrainerWorkoutPlan = () => {
  const [expiryData, setExpiryData] = useState([]);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [expiryTotal, setExpiryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("30");
  const [workouts, setWorkouts] = useState([]);
  const [isOpen, setIsOpen] = useState(0);
  const [addModal, setAddModal] = useState(false);

  const Modaltoggle = () => {
    setAddModal(!addModal);
  };

  // Function to fetch data
  const getDetails = async (orderDirection, page, setData, setTotal, days) => {
    setLoading(true);
    try {
      const response = await trainersService.getAllTrainerWorkoutPlan({
        page,
        limit: pageSize,
      });

      setData(response.data.workoutPlans || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetails("DESC", expiryPage, setExpiryData, setExpiryTotal, days);
  }, [expiryPage, pageSize, days]);

  // Table Columns
  const columns = () => [
    {
      title: "S No.",
      dataIndex: "serial",
      render: (_, __, index) => (
        <div>{index + 1 + (expiryPage - 1) * pageSize}</div>
      ),
    },
    {
      title: "Preferred Name",
      dataIndex: "user_name",
    },
    {
      title: "Fitness Goal",
      dataIndex: "workout_data",
      render: (datas) => {
        if (!datas) return <div>No Workout</div>;
        const data = JSON.parse(datas);
        const workoutIds = data?.map((wrk) => wrk.id); // Extract only IDs
        if (!Array.isArray(workoutIds)) return <div>Invalid workout Data</div>;
        const filterWorkouts = workouts.filter((wrk) =>
          workoutIds.includes(wrk.id)
        );

        return (
          <div>
            {filterWorkouts.length > 0 ? (
              filterWorkouts.map((workout) => (
                <Tag color="cyan" key={workout.id}>
                  {workout.exercise_name}
                </Tag>
              ))
            ) : (
              <div>No Matching workout</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Weight",
      dataIndex: "trainer_name",
      render: (data) => <Tag color="green">71</Tag>,
    },
    {
      title: "Age",
      dataIndex: "user_dob",
      render: (date) => {
        const calculateAge = (dob) => {
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          return age;
        };

        return <Tag color="cyan">{calculateAge(date)} years</Tag>;
      },
    },
    {
      title: "Workout Assigned",
      dataIndex: "trainer_name",
      render: (data) => <Tag color="green">{data}</Tag>,
    },
  ];

  const workoutListData = [
    {
      plan_name: "Full-Body Beginner Plan",
      title: "Newcomers who want a simple strength program",
      sub_title: "3 days in a week",
      description: "3 Full-Body Sessions (Monday, Wednesday, Friday)",
      workout_data: [
        { id: 20, sets: 4, reps: 15 },
        { id: 29, sets: 3, reps: 12 },
        { id: 34, sets: 5, reps: 8 },
      ],
      color: "primary",
    },
    {
      plan_name: "Fat Loss & Conditioning",
      title: "People who want to burn fat & improve endurance",
      sub_title: "HIIT Style, 4 Days a Week",
      description: "4 Days (30-40 min sessions)",
      workout_data: [
        { id: 11, sets: 4, reps: 15 },
        { id: 22, sets: 3, reps: 12 },
        { id: 36, sets: 5, reps: 8 },
      ],
      color: "danger",
    },
    {
      plan_name: "Classic Push-Pull-Legs",
      title: "Gym-goers who want to train muscle groups efficiently",
      sub_title: "6 Days a Week",
      description:
        "Day 1: Push (Chest, Shoulders, Triceps)\nDay 2: Pull (Back, Biceps)\nDay 3: Legs\nRepeat (Days 4, 5, 6)",
      workout_data: [
        { id: 31, sets: 14, reps: 15 },
        { id: 32, sets: 13, reps: 12 },
        { id: 33, sets: 15, reps: 8 },
      ],
      color: "warning",
    },
  ];

  const fetchWorkouts = () => {
    trainersService
      .getAllWorkouts()
      .then((res) => {
        console.log(res?.data);
        if (Array.isArray(res?.data)) {
          setWorkouts(res?.data);
        } else {
          console.error("Fetched goals data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const filteredWorkouts = (workoutData) => {
    if (!Array.isArray(workoutData)) return []; // Ensure it's an array

    const workoutIds = workoutData.map((wrk) => wrk.id); // Extract only IDs
    return workouts.filter((wrk) => workoutIds.includes(wrk.id));
  };
  const toggle = (id) => (isOpen === id ? setIsOpen(null) : setIsOpen(id));
  return (
    <Fragment>
      <Col sm="12" xl="6" md="6">
        <Card>
          <HeaderCard
            title="Plans"
            mainClasses={"d-flex justify-content-between align-items-center"}
            // span1={
            //   <Btn
            //     attrBtn={{
            //       color: "success",
            //       onClick: Modaltoggle,
            //     }}
            //   >
            //     <span>
            //       <i className="fa fa-plus-circle text-white me-2"></i>
            //     </span>
            //     Add Plan
            //   </Btn>
            // }
          />
          <Accordion defaultActiveKey="0">
            <div className="default-according m-4" id="accordion">
             {workoutListData.map((item, i) => ( <Card>
                <CardHeader>
                  <div className="flex ">
                    <H5 attrH5={{ className: "mb-0" }}>
                      <Btn
                        attrBtn={{
                          as: Card.Header,
                          className: "btn btn-link",
                          color: "default",
                          onClick: () => toggle(i),
                        }}
                      >
                        {item.plan_name}
                       {isOpen === i ? <IoIosArrowUp style={{ float: "right" }} />:
                        <IoIosArrowDown style={{ float: "right" }} />}
                      </Btn>
                    </H5>
                  </div>
                </CardHeader>
                <Collapse isOpen={isOpen === i}>
                  <CardBody>
                  <p className="text-dark">⚡Best for: {item.title} </p>
                  <p className="">⚡Workout Structure: {item.description} </p>
                  🏋🏽 Exercise:{" "}
                  {filteredWorkouts(item.workout_data).map((data) => (
                   <p key={data.id} className="">🔹
                      <span>{data.exercise_name}</span> || Sets:{" "}
                      <span> {data.sets}</span> Reps: <span> {data.reps}</span>{" "}
                    </p> 
                  ))}
                  </CardBody>
                </Collapse>
              </Card>))}
            </div>
          </Accordion>
        </Card>
      </Col>
      <Col sm="6" xl="6" md="6">
        <Card>
          <HeaderCard
            title="Client List"
            mainClasses={"d-flex justify-content-between align-items-center"}
          />
          <Table
            loading={loading}
            columns={columns()}
            dataSource={expiryData}
            pagination={{
              current: expiryPage,
              pageSize,
              total: expiryTotal,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
            rowKey={(record) => record.id}
          />
        </Card>
      </Col>

      <AddModal
            viewModal={addModal}
            setViewModal={setAddModal}
            Modaltoggle={Modaltoggle}
          />
    </Fragment>
  );
};

export default TrainerWorkoutPlan;
