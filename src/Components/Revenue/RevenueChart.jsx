import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Label } from "reactstrap";
import Chart from "react-apexcharts";
import HeaderCard from "../Common/Component/HeaderCard";
import ConfigDB from "../../Config/ThemeConfig";
import { DatePicker, Select, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactions } from "../../Redux/slices/transactions";
import moment from "moment";
import dayjs from "dayjs";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import { enUS } from "date-fns/locale";
import { Btn } from "../../AbstractElements";
import { IoIosArrowRoundForward } from "react-icons/io";
import { MdClose } from "react-icons/md";

const { RangePicker } = DatePicker;

const RevenueChart = () => {
  const primary =
    localStorage.getItem("default_color") || ConfigDB.data.color.primary_color;
  const dispatch = useDispatch();
  const { transactions } = useSelector((state) => state.transactions);

  const [revenueType, setRevenueType] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [dates, setDates] = useState([dayjs().startOf("month"), dayjs()]);

  const predefinedRanges = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
    "Last 7 days": [dayjs().subtract(7, "day"), dayjs()],
    "Last 14 days": [dayjs().subtract(14, "day"), dayjs()],
    "Last 30 days": [dayjs().subtract(30, "day"), dayjs()],
    "This week": [dayjs().startOf("week"), dayjs().endOf("week")],
    "Last week": [
      dayjs().subtract(1, "week").startOf("week"),
      dayjs().subtract(1, "week").endOf("week"),
    ],
    "This month": [dayjs().startOf("month"), dayjs()],
  };

  const handleDateRangeChange = (dates, dateStrings) => {
    if (dates) {
      setDateRange({ startDate: dateStrings[0], endDate: dateStrings[1] });
    } else {
      setDateRange({ startDate: "", endDate: "" });
    }
  };

  const handleQuickFilterChange = (value) => {
    let startDate, endDate;
    switch (value) {
      case "today":
        startDate = endDate = moment().format("YYYY-MM-DD");
        break;
      case "yesterday":
        startDate = endDate = moment().subtract(1, "days").format("YYYY-MM-DD");
        break;
      case "last_7_days":
        startDate = moment().subtract(7, "days").format("YYYY-MM-DD");
        endDate = moment().format("YYYY-MM-DD");
        break;
      case "last_14_days":
        startDate = moment().subtract(14, "days").format("YYYY-MM-DD");
        endDate = moment().format("YYYY-MM-DD");
        break;
      case "last_30_days":
        startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
        endDate = moment().format("YYYY-MM-DD");
        break;
      case "this_month":
        startDate = moment().startOf("month").format("YYYY-MM-DD");
        endDate = moment().endOf("month").format("YYYY-MM-DD");
        break;
      case "last_month":
        startDate = moment()
          .subtract(1, "months")
          .startOf("month")
          .format("YYYY-MM-DD");
        endDate = moment()
          .subtract(1, "months")
          .endOf("month")
          .format("YYYY-MM-DD");
        break;
      default:
        startDate = "";
        endDate = "";
    }
    setDateRange({ startDate, endDate });
  };

  const handleRevenueTypeChange = (value) => {
    setRevenueType(value);
  };

  useEffect(() => {
    fetchFilteredTransactions();
  }, [revenueType, dateRange]);

  const currentDate = new Date();

  const fetchFilteredTransactions = () => {
    const filters = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      type: revenueType,
      month:currentDate.getMonth() + 1,
      year:currentDate.getFullYear()
    };
    dispatch(fetchTransactions(filters));
  };

  const data = transactions;

  const [chartData, setChartData] = useState({
    series: [{ name: "Revenue", data: [] }],
    options: {
      chart: { type: "area", height: 350, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "straight" },
      title: { text: "Revenue Analysis", align: "left" },
      colors: ["#00E396"],
      xaxis: { type: "datetime" },
      yaxis: { opposite: false },
      legend: { horizontalAlign: "left" },
    },
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const prices = data.map((item) => parseFloat(item.amount));
      const dates = data.map((item) => new Date(item.created_at).toISOString());

      setChartData((prev) => ({
        ...prev,
        series: [{ name: "Revenue", data: prices }],
        options: { ...prev.options, labels: dates },
      }));
    }
  }, [data]);

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [showPicker, setShowPicker] = useState(false);

  const selectDateRangePicker = (ranges) => {
    setSelectionRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });

    const startDate = new Date(ranges.selection.startDate).toLocaleDateString(
      "en-CA"
    );
    const endDate = new Date(ranges.selection.endDate).toLocaleDateString(
      "en-CA"
    );
    setDateRange({ startDate: startDate, endDate: endDate });
    setShowPicker(false);
  };

  return (
    <Col sm="12" xl="12">
      <Card>
        <HeaderCard
          title={"Total revenue"}
          mainClasses={"d-flex justify-content-between pt-4 pb-2"}
          span1={
            <div className="d-flex">
              <div className="d-flex flex-column mx-1">
                <Label>Select Date Range</Label>
                <div>
                  {showPicker && (
                    <DateRangePicker
                      ranges={[selectionRange]}
                      onChange={selectDateRangePicker}
                      locale={enUS}
                    />
                  )}
                  {showPicker ? (
                    <Btn
                      attrBtn={{
                        color: "light",
                        onClick: () => setShowPicker(!showPicker),
                      }}
                    >
                      <MdClose />
                    </Btn>
                  ):
                  <>
                    <Btn
                      attrBtn={{
                        color: "light",
                        onClick: () => setShowPicker(!showPicker),
                      }}
                    >
                      <span>
                        <i className="fa fa-right-arrow text-white me-2"></i>
                      </span>
                      {selectionRange.startDate.toDateString()}
                    </Btn>
                    <IoIosArrowRoundForward />
                    <Btn
                      attrBtn={{
                        color: "light",
                        onClick: () => () => setShowPicker(!showPicker),
                      }}
                    >
                      <span>
                        <i className="fa fa-calender text-white me-2"></i>
                      </span>
                      {selectionRange.endDate.toDateString()}
                    </Btn>
                  </>}
                </div>
              </div>
              {/* <div className="d-flex flex-column mx-1">
                <Label>Quick Filter</Label>
                <Select
                  placeholder={"Select"}
                  style={{ width: 150 }}
                  allowClear
                  onChange={handleQuickFilterChange}
                  options={[
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "last_7_days", label: "Last 7 days" },
                    { value: "last_14_days", label: "Last 14 Days" },
                    { value: "last_30_days", label: "Last 30 Days" },
                    { value: "this_month", label: "This month" },
                    { value: "last_month", label: "Last month" },
                  ]}
                />
              </div> */}
              <div className="d-flex flex-column mx-1">
                <Label>Revenue Type</Label>
                <Select
                  placeholder={"Select type"}
                  style={{ width: 150 }}
                  allowClear
                  onChange={handleRevenueTypeChange}
                  options={[
                    { value: "", label: "All Revenue" },
                    { value: "package", label: "Memberships" },
                    { value: "trainer", label: "Personal Training" },
                    { value: "ecom", label: "E-commerce" },
                  ]}
                />
              </div>
            </div>
          }
        />
        <CardBody>
          <div id="basic-apex">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height={350}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default RevenueChart;
