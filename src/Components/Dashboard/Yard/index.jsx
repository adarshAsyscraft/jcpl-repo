import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import { deleteYard, fetchYards, searchYards } from "../../../Redux/slices/yardSlice";
import EditYard from "./EditModal";

const Yard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { data, loading } = useSelector((state) => state.yards);
  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedYards, setSelectedYards] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editICD, setEditICD] = useState(null);

  useEffect(() => {
    dispatch(fetchYards({ page: expiryPage, limit: pageSize }));
  }, [dispatch, expiryPage, pageSize]);

  const handleEdit = (record) => {
    setEditICD(record);
    setEditModal(true);
  };

  const handleView = (record) => {
    setSelectedYards(record);
    setViewModal(true);
  };

  const handleClose = () => {
    setViewModal(false);
    setSelectedYards(null);
  };

  const handleDelete = async (id) => {
    dispatch(deleteYard(id)).then(() => {
      dispatch(fetchYards({ page: expiryPage, limit: pageSize }));
    });
  };

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchQuery(trimmedValue);

    if (trimmedValue) {
      dispatch(searchYards(trimmedValue));
    } else {
      dispatch(fetchYards({ page: expiryPage, limit: pageSize }));
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
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
      <Breadcrumbs mainTitle="Yards" parent="Apps" title="Yards" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Yards (${data.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Yards..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
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
            rowKey={(record) => record.id}
          />

          <Modal title="Yard Details" open={viewModal} onCancel={handleClose} footer={[<Button key="close" onClick={handleClose}>Close</Button>]}>            
            {selectedYards && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedYards)
                    .filter(([key]) => !["password", "token", "createdAt", "updatedAt"].includes(key))
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
        <EditYard category={editICD} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default Yard;