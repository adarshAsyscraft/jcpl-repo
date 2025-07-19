import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../_helper/Customizer";
// import {
//   deleteForwarder,
//   fetchForwarders,
//   searchForwarders
// } from "../../../Redux/slices/forwarderSlice";
// import EditTransporters from "./edit";
import { fetchAttendance } from "../../Redux/slices/attendance";
import EditAttendance from "./edit";

const Leave = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { data, loading } = useSelector((state) => state.attendance);

  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedForwarders, setSelectedForwarders] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editTransporter, setEditTransporter] = useState(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      dispatch(fetchAttendance({ page: expiryPage, limit: pageSize }));
    }
  }, [dispatch, expiryPage, pageSize, searchQuery]);

  const handleEdit = (record) => {
    setEditTransporter(record);
    setEditModal(true);
  };

  const handleView = (record) => {
    setSelectedForwarders(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedForwarders(null);
  };

  const handleDelete = async (id) => {
    // dispatch(deleteForwarder(id)).then(() => {
    //   dispatch(fetchForwarders({ page: expiryPage, limit: pageSize }));
    // });
  };

  const handleSearch = async(value) => {
    setSearchQuery(value);
    // if (value.trim() === "") {
    //   await dispatch(fetchForwarders({ page: expiryPage, limit: pageSize }));
    // } else {
    //   await dispatch(searchForwarders(value,expiryPage,pageSize));
    // }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "User ID", dataIndex: "user_id", key: "user_id" },
    { title: "User Type", dataIndex: "user_type", key: "user_type" },
    { title: "Check In", dataIndex: "check_in", key: "check_in" },
    { title: "Check Out", dataIndex: "check_out", key: "check_out" },
    { title: "Late(Hours)", dataIndex: "late", key: "late" },
    { title: "Early Leaving(Hours)", dataIndex: "early_leaving", key: "early_leaving" },
    { title: "Overtime(Hours)", dataIndex: "overtime", key: "overtime" },
    // { title: "Latitude In", dataIndex: "latitude_in", key: "latitude_in" },
    // { title: "Longitude In", dataIndex: "longitude_in", key: "longitude_in" },
    // { title: "Latitude Out", dataIndex: "latitude_out", key: "latitude_out" },
    // { title: "Longitude Out", dataIndex: "longitude_out", key: "longitude_out" },
    { title: "Status", dataIndex: "status", key: "status" },
  
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              shape="circle"
              style={{ backgroundColor: "#14e763", borderColor: "#14e763" }}
              icon={<AiFillEdit />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]; 
  
  return (
    <Fragment>
      <Container fluid className="email-wrap bookmark-wrap todo-wrap mt-4">
        <Card
          title={`Leave (${data.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Leave..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/attendance/add/${layoutURL}`)}
              >
                + Add Leave
              </Button>
            </Space>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={data}
            pagination={{
              current: expiryPage,
              pageSize,
              total: data.length || 0,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
          />
        </Card>
      </Container>
      <EditAttendance category={editTransporter} editModal={editModal} setEditModal={setEditModal} />
    </Fragment>
  );
};

export default  Leave;
