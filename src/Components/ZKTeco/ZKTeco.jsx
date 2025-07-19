import React, { useState, useEffect, useContext, Fragment } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../Config/AppConstant";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { Form, Card, CardBody, FormGroup, Input, Label, Row, Col, Container } from "reactstrap";
import axios from "axios";
import HeaderCard from "../Common/Component/HeaderCard";
import zktecoService from "../../Services/zkteco";
import { CheckCircle, AlertTriangle, RefreshCcw } from "react-feather";
import { Table, Tag } from "antd";
import AreaTable from "./table/Area/AreaTable";

const ZKTeco = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [deviceData, setDeviceData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [panelId, setPanelId] = useState(null);
  const [togglePassword, setTogglePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Fetch and auto-fill panel details
  const fetchDetails = async () => {
    try {
      const res = await zktecoService.getPanelDetail();
      if (res?.data) {
        setUsername(res?.data?.username || "");
        setPassword(res?.data?.password || "");
        setPanelId(res?.data?.id || null);
      }
    } catch (error) {
      console.error("Error fetching panel details:", error);
    }
  };

  // Fetch devices with pagination
  const fetchDevices = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await zktecoService.getAllDevice();
      if (Array.isArray(res?.data?.data)) {
        setDeviceData(res?.data?.data);
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.total || res?.data?.data.length || 0,
          current: page,
          pageSize,
        }));
      } else {
        console.error("Fetched device data is not an array", res?.data);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetails();
    fetchDevices();
  }, []);

  const onChangePagination = (pagination) => {
    fetchDevices(pagination.current, pagination.pageSize);
  };

  // Add or Update Panel Details
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter required fields!");
      return;
    }

    try {
      const payload = { username, password };
      if (panelId) {
        await axios.put(`${API_URL}/zkteco/device/update_detail`, { id: panelId, ...payload });
        toast.success("Panel details updated successfully!");
      } else {
        await axios.post(`${API_URL}/zkteco/device/add_detail`, payload);
        toast.success("Panel details added successfully!");
      }
      fetchDetails();
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.response?.data?.message || "Operation failed!");
    }
  };

  const isDeviceOnline = (lastActivity) => {
    if (!lastActivity) return false;
    const lastActivityTime = new Date(lastActivity);
    const currentTime = new Date();
    return (currentTime - lastActivityTime) / 1000 <= 60*5; // Online if within last 60 seconds
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      render: (_, __, index) => (
        <div>{(pagination.current - 1) * pagination.pageSize + index + 1}</div>
      ),
    },
    {
      title: "Status",
      dataIndex: "last_activity",
      render: (last_activity) => (
        <div className="d-flex align-items-center">
          {isDeviceOnline(last_activity) ? (
            <>
              <span className="bg-light-success font-success rounded-1 p-1 me-2 d-flex align-items-center">
                <CheckCircle />
              </span>
              Online
            </>
          ) : (
            <>
              <span className="bg-light-danger font-danger rounded-1 p-1 me-2 d-flex align-items-center">
                <AlertTriangle />
              </span>
              Offline
            </>
          )}
        </div>
      ),
    },
    { title: "Device ID", dataIndex: "sn" },
    { title: "Device Name", dataIndex: "terminal_name" },
    {
      title: "Area Name/Code",
      dataIndex: "area",
      render: (area) =><div>{area.area_name} / <Tag color="cyan">{area.area_code}</Tag></div> ,
    },
    { title: "Fingerprint Count", dataIndex: "fp_count" },
    { title: "Face Count", dataIndex: "face_count" },
    { title: "Palm Count", dataIndex: "palm_count" },
    { title: "User Count", dataIndex: "user_count" },
    { title: "IP Address", dataIndex: "ip_address" },
    {
      title: "Last Activity",
      dataIndex: "last_activity",
      render: (last_activity) => <Tag color="green">{last_activity}</Tag>,
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs mainTitle="ZKTeco" parent="Apps" title="ZKTeco" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          <Col sm="12" md="6" xl="12">
            <Card>
              <HeaderCard title="Manage ZKTeco Information" />
              <CardBody>
                <Form className="theme-form" onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label className="col-form-label">Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your ZKTeco username"
                      required
                    />
                  </FormGroup>
                  <FormGroup className="position-relative">
                    <Label className="col-form-label">Password</Label>
                    <div className="position-relative">
                      <Input
                        type={togglePassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                      />
                      <div className="show-hide" onClick={() => setTogglePassword(!togglePassword)}>
                        <span className={togglePassword ? "" : "show"}></span>
                      </div>
                    </div>
                  </FormGroup>
                  <div className="form-group mb-0">
                    <Btn attrBtn={{ color: "primary", className: "d-block w-100 mt-2", type: "submit" }}>
                      {panelId ? "Update" : "Add"}
                    </Btn>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col sm="12" md="6" xl="12">
            <Card>
              <HeaderCard
                mainClasses="d-flex justify-content-between"
                title="Available Devices"
                span1={
                  <Btn attrBtn={{ color: "primary", className: "d-flex", onClick: () => fetchDevices() }}>
                    Refresh <RefreshCcw style={{ marginLeft: "10px" }} size={16} />
                  </Btn>
                }
              />
              <div className="table-responsive">
                <Table
                  loading={loading}
                  columns={columns}
                  dataSource={deviceData}
                  pagination={pagination}
                  onChange={onChangePagination}
                  rowKey={(record) => record.id}
                />
              </div>
            </Card>
          </Col>

          <AreaTable/>
        </Row>
      </Container>
    </Fragment>
  );
};

export default ZKTeco;