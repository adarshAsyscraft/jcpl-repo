import React, { Fragment, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import { Breadcrumbs, H5 } from "../../../AbstractElements";

import Chart from "react-apexcharts";
import SmallWidgets from "../../Common/CommonWidgets/SmallWidgets";
import RevenuePieChart from "../../Revenue/RevenuePieChart";
import RevenueChart from "../../Revenue/RevenueChart";
import ConfigDB from "../../../Config/ThemeConfig";
import RecentCheckInActivity from "./RecentCheckInActivity";

const SuperAdmin = () => {
  const primary =
    localStorage.getItem("default_color") || ConfigDB.data.color.primary_color;
  const secondary =
    localStorage.getItem("secondary_color") ||
    ConfigDB.data.color.secondary_color;

  const SmallWidgetsData = [
    {
      title: "Total Active Gyms",
      color: "primary",
      total: 2_435,
      gros: 50,
      icon: "new-order",
    },
    {
      title: "New Gyms Sign-ups",
      color: "warning",
      total: 2_908,
      gros: 20,
      icon: "customers",
    },
    {
      title: "Total Revenue",
      color: "secondary",
      total: 389,
      gros: 10,
      prefix: "$",
      icon: "sale",
      suffix: "k",
    },
    {
      title: "Churn Rate",
      color: "success",
      total: 3_908,
      gros: 80,
      prefix: "$",
      icon: "profit",
    },
    {
      title: "Total Biometric Check-in",
      color: "success",
      total: 3_908,
      gros: 80,
      prefix: "$",
      icon: "profit",
    },
    {
      title: "Pending Support Tickets",
      color: "success",
      total: 3_908,
      gros: 80,
      prefix: "$",
      icon: "profit",
    },
    {
      title: "SMS Balance ",
      color: "success",
      total: 3_908,
      gros: 80,
      prefix: "$",
      icon: "profit",
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

  const series = {
    monthDataSeries1: {
      prices: [
        8107.85, 8128.0, 8122.9, 8165.5, 8340.7, 8423.7, 8423.5, 8514.3,
        8481.85, 8487.7, 8506.9, 8626.2, 8668.95, 8602.3, 8607.55, 8512.9,
        8496.25, 8600.65, 8881.1, 9340.85,
      ],
      dates: [
        "13 Nov 2017",
        "14 Nov 2017",
        "15 Nov 2017",
        "16 Nov 2017",
        "17 Nov 2017",
        "20 Nov 2017",
        "21 Nov 2017",
        "22 Nov 2017",
        "23 Nov 2017",
        "24 Nov 2017",
        "27 Nov 2017",
        "28 Nov 2017",
        "29 Nov 2017",
        "30 Nov 2017",
        "01 Dec 2017",
        "04 Dec 2017",
        "05 Dec 2017",
        "06 Dec 2017",
        "07 Dec 2017",
        "08 Dec 2017",
      ],
    },
  };

  const apexAreaChart = {
    series: [
      {
        name: "STOCK ABC",
        data: series.monthDataSeries1.prices,
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      title: {
        text: "Fundamental Analysis of Stocks",
        align: "left",
      },
      subtitle: {
        text: "Price Movements",
        align: "left",
      },
      colors: ["#40f169"],
      labels: series.monthDataSeries1.dates,
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        opposite: true,
      },
      legend: {
        horizontalAlign: "left",
      },
    },
  };

  const apexPieChart = {
    series: [44, 55, 13],
    options: {
      chart: {
        width: 380,
        type: "pie",
        toolbar: {
          show: false,
        },
      },
      labels: ["Active", "Expire", "Pending"],
      colors: [primary, secondary, "#fb740d"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };
  return (
    <Row className="widget-grid">
      {SmallWidgetsData.map((data, i) => (
        <Col xs="4" key={i}>
          <SmallWidgets data={data} />
        </Col>
      ))}
      {/* <RevenueChart />
      <RevenuePieChart /> */}
      <Col xs="12">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Revenue & New Signups Over Time</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="basic-apex">
              <Chart
                options={apexAreaChart.options}
                series={apexAreaChart.series}
                height="350"
                type="area"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs="12">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Subscription Status</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="piechart">
              <Chart
                options={apexPieChart.options}
                series={apexPieChart.series}
                type="pie"
                width={380}
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs="6">
        <Card>
          <CardHeader className="card-no-border">
            <H5>Daily Check-ins</H5>
          </CardHeader>
          <CardBody className="pt-0">
            <div id="basic-apex">
              <Chart
                options={apexAreaChart.options}
                series={apexAreaChart.series}
                height="350"
                type="area"
              />
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs="6">
            <RecentCheckInActivity/>
      </Col>
    </Row>
  );
};

export default SuperAdmin;
