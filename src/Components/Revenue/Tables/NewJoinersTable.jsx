import React, { Fragment, useState, useEffect } from "react";
import { Card, Col } from "reactstrap";
import { Tag, Button, Space, Table, Select } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import HeaderCard from "../../Common/Component/HeaderCard";
import packagesService from "../../../Services/package";
import { LiaSmsSolid } from "react-icons/lia";
import { MdOutlineAttachEmail } from "react-icons/md";

const NewJoinersTable = () => {
  const [expiryData, setExpiryData] = useState([]);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [expiryTotal, setExpiryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("30");


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
      title: "Last Name",
      dataIndex: "user_last_name",
      render: (name) => (
        <div>
           {name !== null?name:"N/A"}
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "package_title",
      render: (title, data) => (
        <div>
          {title}{`(${data.package_duration} months)`}
        </div>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "created_at",
      render: (date) => (
        <Tag color="green">{new Date(date).toLocaleDateString("en-GB")}</Tag>
      ),
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button
            style={{ backgroundColor: "#14e763" }}
            icon={<WhatsAppOutlined style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
            }}
          />
          <Button
            style={{ backgroundColor: "#ffc107" }}
            icon={<MdOutlineAttachEmail style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
            }}
          />
          <Button
            style={{ backgroundColor: "#22a5db" }}
            icon={<LiaSmsSolid style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Col sm="12" xl="12" md="12">
        <Card>
          <HeaderCard
            title="New Joiners"
            mainClasses={"d-flex justify-content-between align-items-center"}
            span1={
              <div className="d-flex">
                <div className="mx-2">
                <Select
                    defaultValue="30"
                    style={{ width: 120 }}
                    onChange={setDays}
                    options={[
                      { value: "30", label: "30 Days" },
                      { value: "60", label: "60 Days" },
                      { value: "90", label: "90 Days" },
                    ]}
                  />
                </div>
              </div>
            }
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

export default NewJoinersTable;
