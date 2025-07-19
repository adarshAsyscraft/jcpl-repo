import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import { deleteContainer,fetchContainers } from "../../../Redux/slices/container";
import EditContainers from "./edit";

const Containers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { containers, loading } = useSelector((state) => state.container);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedICD, setSelectedICD] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editICD, setEditICD] = useState(null);

  console.log("containers1122::",containers)

  useEffect(() => {
    dispatch(fetchContainers({ page: expiryPage, limit: pageSize }));
  }, [dispatch, expiryPage, pageSize]);

  const handleEdit = (record) => {
    setEditICD(record);
    setEditModal(true);
  };

  const handleView = (record) => {
    setSelectedICD(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedICD(null);
  };

  const handleDelete = async (id) => {
    dispatch(deleteContainer(id)).then(() => {
      dispatch(fetchContainers({ page: expiryPage, limit: pageSize }));
    });
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Optionally implement search logic
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Container Number", dataIndex: "container_number", key: "container_number" },
    { title: "Shipping Line ID", dataIndex: "shipping_line_id", key: "shipping_line_id" },
    { title: "Size", dataIndex: "size", key: "size" },
    { title: "Type", dataIndex: "container_type", key: "container_type" },
    { title: "Tare Weight", dataIndex: "tare_weight", key: "tare_weight" },
    { title: "MG Weight", dataIndex: "mg_weight", key: "mg_weight" },
    { title: "Manufacture Date", dataIndex: "mfd_date", key: "mfd_date" },
    { title: "CSC Validity", dataIndex: "csc_validity", key: "csc_validity" },
    { title: "Remarks", dataIndex: "remarks", key: "remarks" },
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
            <Button type="primary" shape="circle" style={{ backgroundColor: "#14e763", borderColor: "#14e763" }} icon={<AiFillEdit />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="primary" danger shape="circle" icon={<AiFillDelete />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Containers" parent="Apps" title="Containers" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Containers (${containers.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Containers..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/dashboard/containers/add/${layoutURL}`)}
              >
                + Add Containers
              </Button>
            </Space>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={containers}
            pagination={{
              current: expiryPage,
              pageSize,
              total: containers.length,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
            rowKey={(record) => record.id}
          />

          <Modal
            title="Containers Details"
            open={viewModal}
            onCancel={handleClose}
            footer={[<Button key="close" onClick={handleClose}>Close</Button>]}
          >
            {selectedICD && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedICD)
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
        <EditContainers category={editICD} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default Containers;
