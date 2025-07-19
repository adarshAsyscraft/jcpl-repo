import React, { useState, useEffect, Fragment, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Table, Tag, Button, Modal, Input, Breadcrumb } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  fetchAllUsers,
  searchUsers,
} from "../../../Redux/slices/allUserSlice";
import { Space, Tooltip } from "antd";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Btn, Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import AddModal from "./AddUser";
import CustomizerContext from "../../../_helper/Customizer";
import EditModal from "./EditModal";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { users, loading } = useSelector((state) => state.users);
  console.log(users, "this is all  users");
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleEdit = (record) => {
    setEditUser(record); // Set the selected user for editing
    setEditModal(true); // Open the modal
  };

  useEffect(() => {
    dispatch(fetchAllUsers({ page: expiryPage, limit: pageSize }));
  }, [dispatch, expiryPage, pageSize]);

  const handleView = (record) => {
    setSelectedUser(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedUser(null);
  };

  const handleDelete = async (id) => {
    dispatch(deleteUser(id)).then(() => {
      dispatch(fetchAllUsers({ page: expiryPage, limit: pageSize })); // Refresh users list
    });
  };

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchQuery(trimmedValue);

    if (trimmedValue) {
      dispatch(searchUsers(trimmedValue));
    } else {
      dispatch(fetchAllUsers({ page: expiryPage, limit: pageSize }));
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id" },
    { title: "User Name", dataIndex: "userName", key: "userName" },
    { title: "First Name", dataIndex: "firstName", key: "firstName" },
    { title: "Last Name", dataIndex: "lastName", key: "lastName" },
    { title: "ICD Id", dataIndex: "icd_id", key: "icd_id" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 1 ? "green" : "red"}>
          {status === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
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
      <Breadcrumbs mainTitle="Users" parent="Apps" title="Users" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Users (${users.length || 0})`}
          extra={
            <Space>
              {/* Search Input */}
              <Input.Search
                placeholder="Search users..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)} // Call function on change
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />

              {/* Add User Button */}
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() =>
                  navigate(
                    `${process.env.PUBLIC_URL}/dashboard/users/add/${layoutURL}`
                  )
                }
              >
                + Add User
              </Button>
            </Space>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={searchQuery ? users : users}
            pagination={{
              current: expiryPage,
              pageSize,
              total: users.length,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
            rowKey={(record) => record.id}
          />

          <Modal
            title="User Details"
            open={viewModal}
            onCancel={handleClose}
            footer={[
              <Button key="close" onClick={handleClose}>
                Close
              </Button>,
            ]}
          >
            {selectedUser && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedUser)
                    .filter(
                      ([key]) =>
                        ![
                          "password",
                          "token",
                          "createdAt",
                          "updatedAt",
                        ].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key} className="col-md-6 mb-2">
                        <strong className="">
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
        <EditModal
          category={editUser}
          editModal={editModal}
          setEditModal={setEditModal}
        />
      </Container>
    </Fragment>
  );
};

export default Users;
