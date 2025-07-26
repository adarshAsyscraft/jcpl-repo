import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Button, Modal, Input, Space, Tooltip } from "antd";
import { AiFillEye, AiFillEdit, AiFillDelete } from "react-icons/ai";
import { Container } from "reactstrap";
import { Breadcrumbs } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { fetchForwarders } from "../../../Redux/slices/forwarderSlice";
import MeasurementRateAPIs from "../../../Services/measurementRateAPIs";

const MeasurementRate = () => {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const { layoutURL } = useContext(CustomizerContext);
  const forwardersState = useSelector((state) => state.forwarders || {});
  const forwarders = forwardersState?.data || [];

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const res = await MeasurementRateAPIs.getAll({ page, pageSize });

        if (res?.success) {
          // 🔁 Map forwarder ID to forwarder CODE
          const forwarderMap = {};
          forwarders.forEach((fwd) => {
            forwarderMap[fwd.id] = fwd.code; // <-- updated here
          });

          const sortedData = res.data
            .sort((a, b) => a.id - b.id)
            .map((item) => {
              const ids = Array.isArray(item.shiplineForwarders)
                ? item.shiplineForwarders
                : String(item.shiplineForwarders || "")
                    .split(",")
                    .map((id) => id.trim());

              const forwarderCodes = ids
                .map((id) => forwarderMap[id] || id) // fallback to id if code missing
                .join(", ");

              return {
                ...item,
                shiplineForwarders: forwarderCodes,
              };
            });

          setMeasurements(sortedData);
          setFilteredMeasurements(sortedData);
        }
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
      }
    };

    fetchMeasurements();
  }, [page, pageSize, forwarders]); // include forwarders

  const handleSearch = (value) => {
    const trimmed = value.trim().toLowerCase();
    setSearchQuery(value);
    if (trimmed) {
      const filtered = measurements.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(trimmed)
        )
      );
      setFilteredMeasurements(filtered);
    } else {
      setFilteredMeasurements(measurements);
    }
  };

  const handleView = (record) => {
    setSelectedMeasurement(record);
    setViewModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await MeasurementRateAPIs.delete(id);
      if (res?.success) {
        const updated = measurements.filter((item) => item.id !== id);
        setMeasurements(updated);
        setFilteredMeasurements(updated);
        toast.success(`Measurement with ID ${id} deleted.`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const columns = [
    {
      title: "Shipline Forwarders",
      dataIndex: "shiplineForwarders",
      key: "shiplineForwarders",
    },
    { title: "Rate Type", dataIndex: "typeOfRate", key: "typeOfRate" },
    {
      title: "Packages Min Amount",
      dataIndex: "packagesMinAmount",
      key: "packagesMinAmount",
    },
    {
      title: "Additional Packages Rate",
      dataIndex: "additionalPackagesRate",
      key: "additionalPackagesRate",
    },
    {
      title: "Minimum Amount",
      dataIndex: "minAmount",
      key: "minAmount",
    },
    {
      title: "GST Rate",
      dataIndex: "gstRate",
      key: "gstRate",
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs
        mainTitle="Measurement Rates"
        parent="Apps"
        title="Measurement Rates"
      />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Measurement Rates (${filteredMeasurements.length})`}
          extra={
            <Space>
              <Input.Search
                placeholder="Search Measurements..."
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
                    `${process.env.PUBLIC_URL}/dashboard/measurement-rate/add/${layoutURL}`
                  )
                }
              >
                + Add Measurement
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredMeasurements}
            rowKey={(record) => record.id}
            pagination={{
              current: page,
              pageSize,
              total: filteredMeasurements.length,
              showSizeChanger: true,
              onChange: (pg, size) => {
                setPage(pg);
                setPageSize(size);
              },
            }}
          />

          <Modal
            title="Measurement Details"
            open={viewModal}
            onCancel={() => setViewModal(false)}
            footer={[
              <Button key="close" onClick={() => setViewModal(false)}>
                Close
              </Button>,
            ]}
          >
            {selectedMeasurement && (
              <div className="container p-3">
                <div className="row">
                  {Object.entries(selectedMeasurement)
                    .filter(([key]) => !["token"].includes(key))
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
      </Container>
    </Fragment>
  );
};

export default MeasurementRate;
