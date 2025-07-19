import React, { useState, useEffect, Fragment, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, Table, Button, Modal, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Space, Tooltip } from "antd";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import AddModal from "./AddUser";
import CustomizerContext from "../../../_helper/Customizer";
import EditModal from "./EditModal";
import { fetchYards } from "../../../Redux/slices/yardSlice";

const Yards = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { yards, loading } = useSelector((state) => state.yards);

  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedYard, setSelectedYard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editYard, setEditYard] = useState(null);
  const [filteredYards, setFilteredYards] = useState([]);

  useEffect(() => {
    dispatch(fetchYards());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = yards.filter(
        (yard) =>
          yard.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          yard.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredYards(filtered);
    } else {
      setFilteredYards(yards);
    }
  }, [yards, searchQuery]);

  const handleEdit = (record) => {
    setEditYard(record);
    setEditModal(true);
  };

  const handleView = (record) => {
    setSelectedYard(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedYard(null);
  };

  const handleDelete = (id) => {
    toast.info("Delete Yard functionality not implemented.");
    // You can later implement deleteYard logic here
  };

  const handleSearch = (value) => {
    setSearchQuery(value.trim());
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Yard Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
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
      <Breadcrumbs mainTitle="Yards" parent="Apps" title="Yards" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Yards (${filteredYards.length || 0})`}
          extra={
            <Space>
              {/* Search Input */}
              <Input.Search
                placeholder="Search yards..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />

              {/* Add Yard Button */}
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/dashboard/yards/add/${layoutURL}`)}
              >
                + Add Yard
              </Button>
            </Space>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredYards}
            pagination={{
              current: expiryPage,
              pageSize,
              total: filteredYards.length,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
            rowKey={(record) => record.id}
          />

          <Modal
            title="Yard Details"
            open={viewModal}
            onCancel={handleClose}
            footer={[<Button key="close" onClick={handleClose}>Close</Button>]}
          >
            {selectedYard && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedYard)
                    .filter(([key]) => !["createdAt", "updatedAt"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="col-md-6 mb-2">
                        <strong>{key.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                        {String(value)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Modal>
        </Card>

        <EditModal category={editYard} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default Yards;
