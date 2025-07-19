import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Card, Col } from "reactstrap";
import { Tag, Button, Space, Table, Select } from "antd";
import { WhatsAppOutlined } from "@ant-design/icons";
import { MdOutlineAttachEmail } from "react-icons/md";
import { LiaSmsSolid } from "react-icons/lia";
import HeaderCard from "../../Common/Component/HeaderCard";
import packagesService from "../../../Services/package";
import { Btn } from "../../../AbstractElements";

const MembershipTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("expiry");
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(false);

  // Function to fetch data (only for active tab)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await packagesService.getBuyPackage({
        orderType: activeTab,
        page,
        limit: pageSize,
        days,
      });
      setData(response.data.packages);
      setTotal(response.data.pagination.totalRecords);
    } catch (error) {
      console.error(`Error fetching ${activeTab} package details:`, error);
    }
    setLoading(false);
  }, [activeTab, page, pageSize, days]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Table Columns
  const columns = [
    {
      title: "S No.",
      dataIndex: "serial",
      render: (_, __, index) => <div>{index + 1 + (page - 1) * pageSize}</div>,
    },
    { title: "Preferred First Name", dataIndex: "user_name" },
    {
      title: "Last Name",
      dataIndex: "user_last_name",
      render: (name) => <div>{name !== null ? name : "N/A"}</div>,
    },
    {
      title: "Plan",
      dataIndex: "package_title",
      render: (title, data) => (
        <div>
          {title} ({data.package_duration} months)
        </div>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "end_date",
      render: (date) => {
        if (!date) return <Tag color="default">No Date</Tag>;

        const expiryDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysDiff = Math.round(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const statusConfig = [
          { condition: daysDiff === 0, color: "red", message: "Expired today" },
          { condition: daysDiff === 1, color: "orange", message: "Expires tomorrow" },
          { condition: daysDiff === -1, color: "volcano", message: "Expired yesterday" },
          { condition: daysDiff > 1 && daysDiff <= 2, color: "green", message: `Expires in ${daysDiff} days` },
          { condition: daysDiff < -1, color: "gray", message: `Expired on` },
          { condition: true, color: "blue", message: `Expires in ${daysDiff} days` }, // Default
        ];

        const { color, message } = statusConfig.find((s) => s.condition);

        return <Tag color={color}>{message} ({expiryDate.toLocaleDateString("en-GB")})</Tag>;
      },
    },
    {
      title: "Renewal Status",
      dataIndex: "status",
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button style={{ backgroundColor: "#14e763" }} icon={<WhatsAppOutlined style={{ color: "white" }} />} />
          <Button style={{ backgroundColor: "#ffc107" }} icon={<MdOutlineAttachEmail style={{ color: "white" }} />} />
          <Button style={{ backgroundColor: "#22a5db" }} icon={<LiaSmsSolid style={{ color: "white" }} />} />
          <Button color="cyan" variant="outlined">Renew</Button>
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Col sm="12" xl="12" md="12">
        <Card>
          <HeaderCard
            title={`Membership ${activeTab === "expiry" ? "Expiry" : "Renewal"}`}
            mainClasses={"d-flex justify-content-between align-items-center"}
            span1={
              <div className="d-flex">
                <div className="btn-group-pill btn-group">
                  <Btn attrBtn={{ color: "success", size: "sm", active: activeTab === "expiry", outline: true, onClick: () => setActiveTab("expiry") }}>
                    Expiry
                  </Btn>
                  <Btn attrBtn={{ color: "success", size: "sm", active: activeTab === "renewal", outline: true, onClick: () => setActiveTab("renewal") }}>
                    Renewal
                  </Btn>
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
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              onChange: (page, size) => {
                setPage(page);
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

export default MembershipTable;
