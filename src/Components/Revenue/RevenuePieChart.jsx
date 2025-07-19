import React, { Fragment, useState, useEffect } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { DatePicker } from "antd";
import Chart from "react-apexcharts";
import HeaderCard from "../Common/Component/HeaderCard";
import ConfigDB from "../../Config/ThemeConfig";
import transactionsService from "../../Services/transactions";
import moment from "moment";

const RevenuePieChart = () => {
  const [getData, setGetData] = useState("");
  const [getData2, setGetData2] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedDate2, setSelectedDate2] = useState(moment());
  const [categoryChartType, setCategoryChartType] = useState("default");
  const [chartDimensions, setChartDimensions] = useState({
    width: 380,
    height: 380,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth < 480 ? 200 : 380;
      const height = window.innerHeight < 400 ? 300 : 380; // Adjust as needed
      setChartDimensions({ width, height });
    };

    // Update on initial load
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const primary =
    localStorage.getItem("default_color") || ConfigDB.data.color.primary_color;

  const getDetails = async (month, year) => {
    setLoading(true);
    try {
      const response = await transactionsService.getRevenue({ month, year });
      setGetData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching revenue details:", error);
    }
    setLoading(false);
  };
  const getDetails2 = async (month, year) => {
    setLoading(true);
    try {
      const response = await transactionsService.getRevenue({ month, year });
      setGetData2(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching revenue details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const currentDate = new Date();
    getDetails(currentDate.getMonth() + 1, currentDate.getFullYear());
    getDetails2(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, []);

  const handleDateChange = (date, dateString) => {
    if (date) {
      const [month, year] = dateString.split("-");
      setSelectedDate(date);
      getDetails(Number(month), Number(year));
    }
  };
  const handleDateChange2 = (date, dateString) => {
    if (date) {
      const [month, year] = dateString.split("-");
      setSelectedDate2(date);
      getDetails2(Number(month), Number(year));
    }
  };

  const revenueCategoryPackage = getData?.revenue?.find(
    (data) => data.type === "package"
  ) || { total_revenue: 0 };
  const revenueCategoryPersonelTrainer = getData?.revenue?.find(
    (data) => data.type === "trainer"
  ) || { total_revenue: 0 };
  const revenueCategoryEcom = getData?.revenue?.find(
    (data) => data.type === "ecom"
  ) || { total_revenue: 0 };

  const packagePercentage =
    (Number(revenueCategoryPackage.total_revenue) * 100) /
      getData.total_revenue || 0;
  const trainerPercentage =
    (Number(revenueCategoryPersonelTrainer.total_revenue) * 100) /
      getData.total_revenue || 0;
  const ecomPercentage =
    (Number(revenueCategoryEcom.total_revenue) * 100) / getData.total_revenue ||
    0;

  const apexPieChart = {
    series: [packagePercentage, trainerPercentage, ecomPercentage],
    options: {
      chart: {
        width: 480,
        type: "pie",
        toolbar: { show: false },
        events: {
          dataPointSelection: function (event, chartContext, config) {
            // console.log(event, chartContext, config)
            // const clickedLabel =
            //   apexPieChart.options.labels[config.dataPointIndex];
            // const clickedValue = apexPieChart.series[config.dataPointIndex];
            const chartCat = config.dataPointIndex === 0 ? 'package' : config.dataPointIndex === 2 ? 'trainer' : 'ecom'
            setCategoryChartType(chartCat)
          },
        },
      },
      labels: ["Memberships", "Personal Training", "E-commerce"],
      colors: ["#28A745", "#FF9933", "#DD0000"],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
        },
        offsetX: 10,
        offsetY: 10,
        textAnchor: "middle",
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -20,
            minAngleToShowLabel: 5,
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" },
          },
        },
      ],
    },
  };

  const apexPieChart2 = {
    series: [
      (Number(getData2.total_paid) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_pending) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_overdue) * 100) / Number(getData2.total_revenue),
    ],
    options: {
      chart: {
        width: 380,
        type: "pie",
        toolbar: { show: false },
      },
      labels: ["Paid", "Pending", "Overdue..........."],
      colors: ["#28A745", "#FF9933", "#DD0000"],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
        },
        offsetX: 10,
        offsetY: 10,
        textAnchor: "middle",
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -20,
            minAngleToShowLabel: 5,
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "right" },
          },
        },
      ],
    },
  };


  const apexPieChart3 = {
    series: [
      (Number(getData2.total_paid) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_pending) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_overdue) * 100) / Number(getData2.total_revenue),
    ],
    options: {
      chart: {
        width: 380,
        type: "pie",
        toolbar: { show: false },
      },
      labels: ["PT", "Pending", "Overdue..........."],
      colors: ["#28A745", "#FF9933", "#DD0000"],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
        },
        offsetX: 10,
        offsetY: 10,
        textAnchor: "middle",
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -20,
            minAngleToShowLabel: 5,
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "right" },
          },
        },
      ],
    },
  };

  const apexPieChart4 = {
    series: [
      (Number(getData2.total_paid) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_pending) * 100) / Number(getData2.total_revenue),
      (Number(getData2.total_overdue) * 100) / Number(getData2.total_revenue),
    ],
    options: {
      chart: {
        width: 380,
        type: "pie",
        toolbar: { show: false },
      },
      labels: ["Naman", "Sahil", "Harsh..........."],
      colors: ["#28A745", "#FF9933", "#DD0000"],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(2) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "",
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
        },
        offsetX: 10,
        offsetY: 10,
        textAnchor: "middle",
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -20,
            minAngleToShowLabel: 5,
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "right" },
          },
        },
      ],
    },
  };

  return (
    <Fragment>
      <Col sm="12" xl="6" md="6">
        <Card>
          <HeaderCard
            title={`Revenue by Category (${categoryChartType})`}
            mainClasses={"d-flex justify-content-between align-items-center"}
            span1={
              <div className="d-flex flex-column">
                <DatePicker
                  picker="month"
                  format={"MM-YYYY"}
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
            }
          />
          <CardBody className="apex-chart">
            <div id="piechart">
              {categoryChartType === "package" ? (
                <Chart
                  options={apexPieChart3.options}
                  series={apexPieChart3.series}
                  type="pie"
                  width={chartDimensions.width}
                  height={chartDimensions.height}
                />
              ) : categoryChartType === "trainer" ? (
                <Chart
                  options={apexPieChart4.options}
                  series={apexPieChart4.series}
                  type="pie"
                  width={chartDimensions.width}
                  height={chartDimensions.height}
                />
              ) : (
                <Chart
                  options={apexPieChart.options}
                  series={apexPieChart.series}
                  type="pie"
                  width={chartDimensions.width}
                  height={chartDimensions.height}
                />
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col sm="12" xl="6" md="6">
        <Card>
          <HeaderCard
            title={"Revenue by Status"}
            mainClasses={"d-flex justify-content-between align-items-center"}
            span1={
              <div className="d-flex flex-column">
                <DatePicker
                  format={"MM-YYYY"}
                  value={selectedDate2}
                  onChange={handleDateChange2}
                  picker="month"
                />
              </div>
            }
          />
          <CardBody className="apex-chart">
            <div id="piechart">
              <Chart
                options={apexPieChart2.options}
                series={apexPieChart2.series}
                type="pie"
                width={chartDimensions.width}
                height={chartDimensions.height}
              />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Fragment>
  );
};

export default RevenuePieChart;
