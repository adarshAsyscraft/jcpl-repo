import React, { Fragment, useState, useEffect } from "react";
import { Card, Col, Label } from "reactstrap";
import { Tag, Button, Space, Table, Select } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import HeaderCard from "../../Common/Component/HeaderCard";
import packagesService from "../../../Services/package";
import { LiaSmsSolid } from "react-icons/lia";
import { MdOutlineAttachEmail } from "react-icons/md";
import moment from "moment";


const StaffAttendanceTable = () => {
  const [expiryData, setExpiryData] = useState([]);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [expiryTotal, setExpiryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("30");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });


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
        startDate = moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD");
        endDate = moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD");
        break;
      default:
        startDate = "";
        endDate = "";
    }
    setDateRange({ startDate, endDate });
  };


  // Function to fetch data
  const getDetails = async (orderDirection, page, setData, setTotal , days) => {
    setLoading(true);
    try {
      const response = await packagesService.getBuyPackage({
        page,
        limit: pageSize,
        days
      });

      setData(response.data.packages || []);
      setTotal(response.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetails("DESC", expiryPage, setExpiryData, setExpiryTotal , days);
  }, [expiryPage, pageSize , days]);

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
      title: "Preferred First Name",
      dataIndex: "user_name",
    },
    {
      title: "Role",
      dataIndex: "created_at",
      render: (date) => (
        <Tag color="green">{new Date(date).toLocaleDateString("en-GB")}</Tag>
      ),
    },
    {
      title: "Check-In Time",
      dataIndex: "created_at",
      render: (date) => (
        <Tag color="green">{new Date(date).toLocaleDateString("en-GB")}</Tag>
      ),
    },
    {
      title: "Check-Out Time",
      dataIndex: "created_at",
      render: (date) => (
        <Tag color="green">{new Date(date).toLocaleDateString("en-GB")}</Tag>
      ),
    },
   
    // {
    //   title: "Options",
    //   dataIndex: "options",
    //   render: (_, row) => (
    //     <Space>
    //       <Button
    //         style={{ backgroundColor: "#14e763" }}
    //         icon={<WhatsAppOutlined style={{ color: "white" }} />}
    //         onClick={() => {
    //           // Handle WhatsApp click
    //         }}
    //       />
    //       <Button
    //         style={{ backgroundColor: "#ffc107" }}
    //         icon={<MdOutlineAttachEmail style={{ color: "white" }} />}
    //         onClick={() => {
    //           // Handle WhatsApp click
    //         }}
    //       />
    //       <Button
    //         style={{ backgroundColor: "#22a5db" }}
    //         icon={<LiaSmsSolid style={{ color: "white" }} />}
    //         onClick={() => {
    //           // Handle WhatsApp click
    //         }}
    //       />
    //     </Space>
    //   ),
    // },
  ];

  return (
    <Fragment>
      <Col sm="12" xl="12" md="12" className="mt-2">
        <Card>
          <HeaderCard
            title="Staff Attendance"
            mainClasses={"d-flex justify-content-between align-items-center"}
            // span1={
            //   <div className="d-flex flex-column mx-1">
            //   <Select
            //     placeholder={'Select'}
            //     style={{ width: 150 }}
            //     allowClear
            //     onChange={handleQuickFilterChange}
            //     options={[
            //       { value: "today", label: "Today" },
            //       { value: "yesterday", label: "Yesterday" },
            //       { value: "last_7_days", label: "Last 7 days" },
            //       { value: "last_14_days", label: "Last 14 Days" },
            //       { value: "last_30_days", label: "Last 30 Days" },
            //       { value: "this_month", label: "This month" },
            //       { value: "last_month", label: "Last month" },
            //     ]}
            //   />
            // </div>
            // }
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
    </Fragment>
  );
};

export default StaffAttendanceTable;
