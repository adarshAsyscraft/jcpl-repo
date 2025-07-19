import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import {
  deleteForwarder,
  fetchForwarders,
  searchForwarders,
  updateForwarder,
} from "../../../Redux/slices/forwarderSlice";
import EditTransporters from "./edit";
import { toast } from "react-toastify";

const Forwarders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { data, loading } = useSelector((state) => state.forwarders);

  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedForwarders, setSelectedForwarders] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editTransporter, setEditTransporter] = useState(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      dispatch(fetchForwarders({ page: expiryPage, limit: pageSize }));
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
    const values = { status: 0 };
    dispatch(updateForwarder({ id, updatedData: values })).then((res) => {
      console.log("updateForwarder::", res);
      if (res.payload.success) {
        toast.success("Forwarder Deleted Successfully!");
        dispatch(fetchForwarders({ page: expiryPage, limit: pageSize }));
      }
    });
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.trim() === "") {
      await dispatch(fetchForwarders({ page: expiryPage, limit: pageSize }));
    } else {
      await dispatch(searchForwarders(value, expiryPage, pageSize));
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (value) =>
        value == 1 ? (
          <Tag color="green">JCPL Client</Tag>
        ) : (
          <Tag color="red">Non-JCPL Client</Tag>
        ),
    },
    // { title: "Pin Code", dataIndex: "pinCode", key: "pinCode" },
    // { title: "Country", dataIndex: "country", key: "country" },
    // { title: "State", dataIndex: "state", key: "state" },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (value) =>
        value == "shipping" ? (
          <Tag color="green">shipping</Tag>
        ) : (
          <Tag color="orange">forwarder</Tag>
        ),
    },
    { title: "Email 1", dataIndex: "email1", key: "email1" },
    {
      title: "CP Mobile Number",
      dataIndex: "cpMobileNumber",
      key: "cpMobileNumber",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="primary"
              shape="circle"
              icon={<AiFillEye />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              shape="circle"
              style={{ backgroundColor: "#14e763", borderColor: "#14e763" }}
              icon={<AiFillEdit />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<AiFillDelete />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Shipping Line/Forwarders"
        parent="Apps"
        title="Shipping Line/Forwarders"
      />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Shipping Line/Forwarders (${data.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Forwarders..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() =>
                  navigate(
                    `${process.env.PUBLIC_URL}/dashboard/forwarders/add/${layoutURL}`
                  )
                }
              >
                + Add Forwarders
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

          <Modal
            title="Forwarders Details"
            open={viewModal}
            onCancel={handleClose}
            footer={[
              <Button key="close" onClick={handleClose}>
                Close
              </Button>,
            ]}
          >
            {selectedForwarders && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedForwarders)
                    .filter(([key]) => !["password", "token"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="col-md-6 mb-2">
                        <strong>
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </strong>{" "}
                        {String(value)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Modal>
        </Card>
        <EditTransporters
          category={editTransporter}
          editModal={editModal}
          setEditModal={setEditModal}
        />
      </Container>
    </Fragment>
  );
};

export default Forwarders;
