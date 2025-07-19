import React, { Fragment, useEffect,useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import { Breadcrumbs, H5 } from "../../../AbstractElements";

import Chart from "react-apexcharts";
import SmallWidgets from "../../Common/CommonWidgets/SmallWidgets";
import RevenuePieChart from "../../Revenue/RevenuePieChart";
import RevenueChart from "../../Revenue/RevenueChart";
import adminService from "../../../Services/admin";
import { useDispatch, useSelector } from "react-redux";
import packagesService from "../../../Services/package";

const Admin = () => {
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.transactions);
const [dashboardData, setDashboardData] = useState('')


const [membershipChartData, setMembershipChartData] = useState({
  series: [
    {
      name: "New sign-ups",
      data: [],
    },
    {
      name: "Cancellations",
      data: [],
    },
  ],
  options: { 
    chart: {height: 350,type: "area",toolbar: {show: false,},},
    dataLabels: {enabled: false,},
    colors: ["#40f169", "#ff668e"],
    stroke: {curve: "smooth",},
    xaxis: {
      type: "datetime",
      categories: [
        "2018-09-19T00:00:00.000Z",
        "2018-09-19T01:30:00.000Z",
        "2018-09-19T02:30:00.000Z",
        "2018-09-19T03:30:00.000Z",
        "2018-09-19T04:30:00.000Z",
        "2018-09-19T05:30:00.000Z",
        "2018-09-19T06:30:00.000Z",
      ],
    },
    tooltip: {x: {format: "dd/MM/yy HH:mm",},
    },
  },
});

const data =  transactions;

// useEffect(() => {
//   if (data && Array.isArray(data)) {
//     const userCount = data.map((item) => parseFloat(item.amount));
//     const dates = data.map((item) => new Date(item.created_at).toISOString());

//     setMembershipChartData((prev) => ({
//       ...prev,
//       series: [{ name: "New sign-ups", data: userCount },{ name: "Cancellations", data: userCount }],
//       options: { ...prev.options, labels: dates },
//     }));
//   }
// }, [data]);

const fetchMembershipData = () => {
  packagesService
    .getMembershipData()
    .then((res) => {
      // console.log(res?.data);
      if (res?.data && Array.isArray(res?.data)) {
        const data =  res?.data
        const newUserCount = data.map((item) => item.newusercount); 
        const cancelUserCount = data.map((item) => parseFloat(item.cancelusercount));
        const dates = data.map((item) => new Date(item.date).toISOString());
    
        setMembershipChartData((prev) => ({
          ...prev,
          series: [{ name: "New sign-ups", data: newUserCount },{ name: "Cancellations", data: cancelUserCount }],
          options: { ...prev.options, labels: dates },
        }));
      }
    })
    .catch((error) => {
      console.log(error);
    });
};


const fetchWorkouts = () => {
  adminService
    .getDashboardData()
    .then((res) => {
      // console.log(res?.data);
      setDashboardData(res?.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

useEffect(() => {
  fetchWorkouts();
  fetchMembershipData();
}, []);

const totalLastMonthLeads = Number(dashboardData?.totalLastMonthLeads) || 0;
const totalLeads = Number(dashboardData?.totalLeads) || 1;

const totalLastMonthUsers = Number(dashboardData?.totalLastMonthUsers) || 0;
const totalUsers = Number(dashboardData?.totalUsers) || 1;

const totalLastMonthNewUser = Number(dashboardData?.totalLastMonthNewUser) || 0;
const totalNewUser = Number(dashboardData?.totalNewUser) || 1;

const SmallWidgetsData = [
  {
    title: "Active Members",
    color: "warning",
    total: totalUsers,
    gros: (totalLastMonthUsers * 100) / totalUsers,
    move: totalLastMonthUsers >= 0 ? (totalLastMonthUsers * 100) / totalUsers : -1 * ((totalLastMonthUsers * 100) / totalUsers),
    icon: "customers",
  },
  {
    title: "Hot Leads",
    color: "primary",
    total: totalLeads,
    gros: (totalLastMonthLeads * 100) / totalLeads,
    move: totalLastMonthLeads >= 0 ? (totalLastMonthLeads * 100) / totalLeads : -1 * ((totalLastMonthLeads * 100) / totalLeads),
    icon: "customers",
  },
  {
    title: "Attendance Today",
    color: "secondary",
    total: 0,
    gros: 0,
    // prefix: "$",
    icon: "customers",
    // suffix: "k",
  },
  {
    title: "Staff Activity",
    color: "success",
    total: 0,
    gros: 0,
    // prefix: "$",
    icon: "customers",
  },
  {
    title: "Memberships Expiring",
    color: "secondary",
    total: 0,
    gros: 0,
    // prefix: "$",
    icon: "customers",
  },
  {
    title: "New Joiners",
    color: "warning",
    total: totalNewUser,
    gros: (totalLastMonthNewUser * 100) / totalNewUser,
    move: totalLastMonthNewUser >= 0 ? (totalLastMonthNewUser * 100) / totalNewUser : -1 * ((totalLastMonthNewUser * 100) / totalNewUser),
    icon: "customers",
  },
];


  const areaSpaline = {
    series: [
      {
        name: "New sign-ups",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "Cancellations",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#40f169", "#ff668e"],
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    },
  };
  const areaSpaline2 = {
    series: [
      {
        name: "New sign-ups",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "Cancellations",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#40f169", "#ff668e"],
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    },
  };
  const areaSpaline3 = {
    series: [
      {
        name: "Top-selling products",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "Sales revenue",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#40f169", "#ff668e"],
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    },
  };

  return (
    <Row className="widget-grid">
      {SmallWidgetsData.map((data, i) => (
        <Col xs="4" key={i}>
          <SmallWidgets data={data} />
        </Col>
      ))}
      <RevenueChart />
      <RevenuePieChart />
      <Col xs="6">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Membership Trends</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="basic-apex">
              <Chart
                options={membershipChartData.options}
                series={membershipChartData.series}
                height="350"
                type="area"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs="6">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Attendance Trends</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="basic-apex">
              <Chart
                options={areaSpaline2.options}
                series={areaSpaline2.series}
                height="350"
                type="area"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs="6">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Product Sales</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="basic-apex">
              <Chart
                options={areaSpaline3.options}
                series={areaSpaline3.series}
                height="350"
                type="area"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Admin;
