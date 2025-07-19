import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Card, Col } from "reactstrap";
import { Tag, Button, Space, Table, Select } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";
import { MdOutlineAttachEmail } from "react-icons/md";
import { LiaSmsSolid } from "react-icons/lia";
import HeaderCard from "../../Common/Component/HeaderCard";
import packagesService from "../../../Services/package";
import { Btn } from "../../../AbstractElements";

const PendingPaymentsTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("expiry");
  const [days, setDays] = useState("30");


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await packagesService.getBuyPackage({
        orderType: activeTab === "expiry" ? "overdue" : "upcoming",
        page,
        limit: pageSize,
        days,
      });
      setData(response.data.packages || []);
      setTotalRecords(response.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.error(`Error fetching package details:`, error);
    }
    setLoading(false);
  }, [activeTab, page, pageSize, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      title: "S No.",
      dataIndex: "serial",
      render: (_, __, index) => <div>{index + 1 + (page - 1) * pageSize}</div>,
    },
    {
      title: "Preferred First Name",
      dataIndex: "user_name",
    },
    {
      title: "Last Name",
      dataIndex: "user_last_name",
      render: (name) => <div>{name || "N/A"}</div>,
    },
    {
      title: "Plan",
      dataIndex: "package_title",
      render: (title, record) => <div>{title} ({record.package_duration} months)</div>,
    },
    {
      title: "Amount Due",
      dataIndex: "due_amount",
    },
    {
      title: "Due Date",
      dataIndex: "due_payment_date",
      render: (date) => {
        if (!date) return <Tag color="default">No Date</Tag>;

        const expiryDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysDiff = Math.round(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const statusConfig = [
          { condition: daysDiff === 0, color: "red", message: `Due today (${expiryDate.toLocaleDateString("en-GB")})` },
          { condition: daysDiff === 1, color: "orange", message: `Due tomorrow (${expiryDate.toLocaleDateString("en-GB")})` },
          { condition: daysDiff <0, color: "gray", message: `Overdue by ${Math.abs(daysDiff)} days` },
          { condition: true, color: "blue", message: `Due in ${daysDiff} days (${expiryDate.toLocaleDateString("en-GB")})` }, // Default
        ];

        const { color, message } = statusConfig.find((s) => s.condition);

        return <Tag color={color}>{message} ({expiryDate.toLocaleDateString("en-GB")})</Tag>;
      },
    },
    {
      title: "Options",
      render: () => (
        <Space>
          <Button style={{ backgroundColor: "#14e763" }} icon={<WhatsAppOutlined style={{ color: "white" }} />} />
          <Button style={{ backgroundColor: "#ffc107" }} icon={<MdOutlineAttachEmail style={{ color: "white" }} />} />
          <Button style={{ backgroundColor: "#22a5db" }} icon={<LiaSmsSolid style={{ color: "white" }} />} />
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Col sm="12" xl="12" md="12">
        <Card>
          <HeaderCard
            title={`${activeTab === "expiry" ? "Overdue" : "Upcoming"} Payments`}
            mainClasses="d-flex justify-content-between align-items-center"
            span1={
              <div className="d-flex">
                <div className="btn-group-pill btn-group">
                  <Btn attrBtn={{ color: "success", size: "sm", active: activeTab === "expiry", outline: true, onClick: () => setActiveTab("expiry") }}>Overdue</Btn>
                  <Btn attrBtn={{ color: "success", size: "sm", active: activeTab === "renewal", outline: true, onClick: () => setActiveTab("renewal") }}>Upcoming</Btn>
                </div>
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
            columns={columns}
            dataSource={data}
            pagination={{
              current: page,
              pageSize,
              total: totalRecords,
              showSizeChanger: true,
              onChange: (page, size) => {
                setPage(page);
                setPageSize(size);
              },
            }}
            rowKey="id"
          />
        </Card>
      </Col>
    </Fragment>
  );
};

export default PendingPaymentsTable;