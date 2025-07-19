import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import EditModal from "./EditModal";
import { deleteICD, fetchICDs } from "../../../Redux/slices/icdsSlice";

const Icds = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);
  const { icds, loading } = useSelector((state) => state.icd);

  const [expiryPage, setExpiryPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModal, setViewModal] = useState(false);
  const [selectedICD, setSelectedICD] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredICDs, setFilteredICDs] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editICD, setEditICD] = useState(null);

  useEffect(() => {
    dispatch(fetchICDs({ page: expiryPage, limit: pageSize })).then((res) => {
      setFilteredICDs(res.payload);
    });
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
    dispatch(deleteICD(id)).then(() => {
      dispatch(fetchICDs({ page: expiryPage, limit: pageSize })).then((res) => {
        setFilteredICDs(res.payload);
      });
    });
  };

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    setSearchQuery(trimmedValue);

    if (trimmedValue !== "") {
      const filtered = icds.filter((icd) =>
        Object.values(icd).some((val) =>
          String(val).toLowerCase().includes(trimmedValue.toLowerCase())
        )
      );
      setFilteredICDs(filtered);
    } else {
      setFilteredICDs(icds);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Country", dataIndex: "country", key: "country" },
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
            <Button type="primary" danger shape="circle" icon={<AiFillDelete />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs mainTitle="ICDs" parent="Apps" title="ICDs" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`ICDs (${filteredICDs.length || 0})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search ICDs..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery}
                style={{ width: 200, borderColor: "#28a745" }}
              />
              <Button
                type="primary"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => navigate(`${process.env.PUBLIC_URL}/dashboard/icds/add/${layoutURL}`)}
              >
                + Add ICD
              </Button>
            </Space>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredICDs}
            pagination={{
              current: expiryPage,
              pageSize,
              total: filteredICDs.length,
              showSizeChanger: true,
              onChange: (page, size) => {
                setExpiryPage(page);
                setPageSize(size);
              },
            }}
            rowKey={(record) => record.id}
          />

          <Modal title="ICD Details" open={viewModal} onCancel={handleClose} footer={[<Button key="close" onClick={handleClose}>Close</Button>]}>
            {selectedICD && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedICD)
                    .filter(([key]) => !["password", "token", "created_at", "updated_at"].includes(key))
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
        <EditModal category={editICD} editModal={editModal} setEditModal={setEditModal} />
      </Container>
    </Fragment>
  );
};

export default Icds;
