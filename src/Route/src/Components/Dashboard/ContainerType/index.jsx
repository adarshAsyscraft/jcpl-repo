import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import EditTransporters from "./edit";
import { deleteConatinerTypes,fetchContainerTypes,searchContainerTypes } from "../../../Redux/slices/containerTypesSlice";

const ContainerTypes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { data, loading } = useSelector((state) => state.containerTypes);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedContainerType, setSelectedContainerType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editTransporter, setEditTransporter] = useState(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      dispatch(fetchContainerTypes({ page: expiryPage, limit: pageSize }));
    }
  }, [dispatch, expiryPage, pageSize, searchQuery]);

  const handleEdit = (record) => {
    setEditTransporter(record);
    setEditModal(true);
  };

  const handleView = (record) => {
    setSelectedContainerType(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedContainerType(null);
  };

  const handleDelete = async (id) => {
    dispatch(deleteConatinerTypes(id)).then(() => {
      dispatch(fetchContainerTypes({ page: expiryPage, limit: pageSize }));
    });
  };


  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.trim() === "") {
      await dispatch(fetchContainerTypes({ page: expiryPage, limit: pageSize }));
    } else {
      await dispatch(searchContainerTypes(value));
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
    { title: "Updated At", dataIndex: "updated_at", key: "updated_at" },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button type="primary" shape="circle" icon={<AiFillEye />} onClick={() => handleView(record)} />
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
      <Breadcrumbs mainTitle="ContainerTypes" parent="Apps" title="ContainerTypes" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`ContainerTypes (${data.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search ContainerTypes..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/dashboard/containerTypes/add/${layoutURL}`)}
              >
                + Add ContainerTypes
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
              total: data.length,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
          />

          <Modal
            title="ContainerTypes Details"
            open={viewModal}
            onCancel={handleClose}
            footer={[<Button key="close" onClick={handleClose}>Close</Button>]}
          >
            {selectedContainerType && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedContainerType)
                    .filter(([key]) => !["password", "token"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="col-md-6 mb-2">
                        <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong> {String(value)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Modal>
        </Card>
        <EditTransporters category={editTransporter} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default ContainerTypes;
