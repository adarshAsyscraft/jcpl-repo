import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import { useNavigate } from "react-router";
import CustomizerContext from "../../../_helper/Customizer";
import ClientService from "../../../Services/clientApi";
import EditClientModal from "./EditClient";
import { toast } from "react-toastify";

const Client = () => {
  const navigate = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await ClientService.getAll({ page, pageSize });
        console.log("Result::", res);
        if (res?.success) {
          const clientData = res.data.sort((a, b) => a.id - b.id);
          setClients(clientData);
          setFilteredClients(clientData);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };

    fetchClients();
  }, [page, pageSize, editModal]);

  console.log("editModal::", editModal);

  const handleSearch = (value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchQuery(value);
    if (trimmedValue) {
      const filtered = clients.filter((client) =>
        Object.values(client).some((val) =>
          String(val).toLowerCase().includes(trimmedValue)
        )
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  };

  const handleView = (record) => {
    setSelectedClient(record);
    setViewModal(true);
  };

  const handleEdit = (record) => {
    setEditClient(record);
    setEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      // Call the API to delete the client from backend
      const res = await ClientService.delete(id);

      if (res?.success) {
        // Remove client locally from both clients and filteredClients
        const updatedClients = clients.filter((item) => item.id !== id);
        setClients(updatedClients);
        setFilteredClients(updatedClients);
        toast.success(`Client with ID ${id} is deleted`);
      } else {
        console.error("Delete failed", res);
        // Optionally show a message to user here
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      // Optionally show error notification to user here
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Client Name", dataIndex: "clientName", key: "clientName" },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    { title: "Country", dataIndex: "country", key: "country" },
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
      <Breadcrumbs mainTitle="Clients" parent="Apps" title="Clients" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Clients (${filteredClients.length})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Clients..."
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
                    `${process.env.PUBLIC_URL}/dashboard/survey-clients/add/${layoutURL}`
                  )
                }
              >
                + Add Client
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredClients}
            rowKey={(record) => record.id}
            pagination={{
              current: page,
              pageSize,
              total: filteredClients.length,
              showSizeChanger: true,
              onChange: (pg, size) => {
                setPage(pg);
                setPageSize(size);
              },
            }}
          />

          <Modal
            title="Client Details"
            open={viewModal}
            onCancel={() => setViewModal(false)}
            footer={[
              <Button key="close" onClick={() => setViewModal(false)}>
                Close
              </Button>,
            ]}
          >
            {selectedClient && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedClient)
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

          {/* Placeholder Edit Modal */}
          {editModal && (
            <EditClientModal
              client={editClient}
              editModal={editModal}
              setEditModal={setEditModal}
            />
          )}
        </Card>
      </Container>
    </Fragment>
  );
};

export default Client;
