import React, { Fragment, useState, useEffect } from "react";
import { Card, Col } from "reactstrap";
import { Tag, Button, Space, Table } from "antd";
import HeaderCard from "../../../Common/Component/HeaderCard";
import { DeleteTwoTone, EditOutlined } from "@ant-design/icons";
import zktecoService from "../../../../Services/zkteco";
import { Btn } from "../../../../AbstractElements";
import AddModal from "./AddModal";
import EditModal from "./EditModal";

const AreaTable = () => {
  const [expiryData, setExpiryData] = useState([]);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [expiryTotal, setExpiryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [viewData, setViewData] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const EditModaltoggle = (data) => {
    setViewData(data);
    setEditModal(!editModal);
  };
  const Modaltoggle = () => setViewModal(!viewModal);

  // Function to fetch data
  const getDetails = async (page, setData, setTotal) => {
    setLoading(true);
    try {
      const response = await zktecoService.getAllArea({
        page,
        paze_size: pageSize,
      });

      setData(response.data.data || []);
      setTotal(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetails(expiryPage, setExpiryData, setExpiryTotal);
  }, [expiryPage, pageSize]);

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
      title: "Area Code",
      dataIndex: "area_code",
      render: (data) => <Tag color="cyan">{data}</Tag>,
    },
    {
      title: "Area Name",
      dataIndex: "area_name",
      render: (data) => <Tag color="green">{data}</Tag>,
    },
    {
      title: "Parent Area",
      dataIndex: "parent_area",
      render: (data) => <div>{data ? data : "N/A"}</div>,
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button icon={<DeleteTwoTone twoToneColor="#eb2f2f" />} />
        </Space>
      ),
    },
  ];

  const handleAddArea = () => {
    console.log("first");
  };

  return (
    <Fragment>
      <Col sm="12" xl="12" md="12" className="mt-2">
        <Card>
          <HeaderCard
            title="Areas"
            mainClasses={"d-flex justify-content-between align-items-center"}
            span1={
              <div className="d-flex flex-column mx-1">
                <Btn
                  attrBtn={{
                    color: "primary",
                    className: "d-flex",
                    onClick: Modaltoggle,
                  }}
                >
                  Add Area
                </Btn>
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
      <AddModal
        viewModal={viewModal}
        setViewModal={setViewData}
        Modaltoggle={Modaltoggle}
        currentPage={expiryPage}
        areaData={expiryData}
        fetchData={() => getDetails(expiryPage, setExpiryData, setExpiryTotal)} // Pass function reference
      />
      <EditModal
        category={viewData}
        editModal={editModal}
        setEditModal={setEditModal}
        EditModaltoggle={EditModaltoggle}
      />
    </Fragment>
  );
};

export default AreaTable;
