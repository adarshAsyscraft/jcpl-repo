import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import {
  deleteTransporter,
  fetchTransporters,
  searchTransporters,
  updateTransporter
} from "../../../Redux/slices/transporterSlice";
import EditTransporters from "./edit";
import { toast } from "react-toastify";

const Transporters = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { data, loading } = useSelector((state) => state.transporters);

  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedICD, setSelectedICD] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editTransporter, setEditTransporter] = useState(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      dispatch(fetchTransporters({ page: expiryPage, limit: pageSize }));
    }
  }, [dispatch, expiryPage, pageSize, searchQuery]);

  const handleEdit = (record) => {
    setEditTransporter(record);
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
    const values = { status: 0 }
    await dispatch(updateTransporter({ id, updatedData:values})).then((res) => {
      if(res.payload.success){
        console.log("res.payload.success::",res.payload)
        toast.success("Transporter Deleted Successfully")
        dispatch(fetchTransporters({ page: expiryPage, limit: pageSize }));
      }
    });
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.trim() === "") {
      dispatch(fetchTransporters({ page: expiryPage, limit: pageSize }));
    } else {
      dispatch(searchTransporters(value));
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Contact Person", dataIndex: "contactPerson", key: "contactPerson" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Address", dataIndex: "address", key: "address" },
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
      <Breadcrumbs mainTitle="Transporters" parent="Apps" title="Transporters" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Transporters (${data.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Transporters..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/dashboard/transporter/add/${layoutURL}`)}
              >
                + Add Transporters
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
            title="Transporters Details"
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
        <EditTransporters category={editTransporter} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default Transporters;
