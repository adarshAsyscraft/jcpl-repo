import React, { useState, useEffect, Fragment, useContext } from "react";
import { Space, Button, Tag, Modal, Select, Table } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API_URL } from "../../Config/AppConstant";
import { Breadcrumbs } from "../../AbstractElements";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { fetchLeads } from "../../Redux/slices/leads";
import { Card, Container } from "reactstrap";
import axios from "axios";
import zktecoService from "../../Services/zkteco";

const ZktecoUsers = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getUsers, setGetUsers] = useState([]);
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { pagination } = useSelector((state) => state.leads);

  const fetchUsers = () => {
    dispatch(
      fetchLeads({
        page: currentPage,
        limit: pageSize,
      })
    );
  };

  const fetchZKtecoUsers = async () => {
    try {
      setLoader(true);
      const res = await zktecoService.getAllUsers();
      if (Array.isArray(res?.data?.data)) {
        setGetUsers(res?.data?.data);
      } else {
        console.error("Fetched activity data is not an array", res?.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchZKtecoUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/delete-user/${id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    }
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      render: (_, __, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    { title: "Employee Code", dataIndex: "emp_code" },
    { title: "First Name", dataIndex: "first_name" },
    { title: "Last Name", dataIndex: "last_name" },
    { title: "Mobile", dataIndex: "mobile" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Date of Joining",
      dataIndex: "hire_date",
      render: (date) => <Tag color="green">{date}</Tag>,
    },
    {
      title: "Position",
      dataIndex: "position",
      render: (data) => <span>{data?.position_name}</span>,
    },
    {
      title: "Employee Type",
      dataIndex: "emp_type",
      render: (data) => (
        <Tag color={data === 1 ? "green" : "red"}>{data === 1 ? "Permanent" : "Temporary"}</Tag>
      ),
    },
    { title: "Address", dataIndex: "address" },
    {
      title: "Date of Birth",
      dataIndex: "birthday",
      render: (date) => <Tag color="green">{date}</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`)}
          />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(row.id)} />
        </Space>
      ),
    },
  ];

  const onChangePagination = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="ZKTeco" parent="Apps" title="ZKTeco" />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Card>
          <Table
          style={{}}
            loading={loader}
            columns={columns}
            dataSource={getUsers}
            pagination={{
              current: pagination?.currentPage || currentPage,
              pageSize: pagination?.limit || pageSize,
              total: pagination?.total || 0,
              showSizeChanger: true,
            }}
            onChange={onChangePagination}
            rowKey={(record) => record.id}
          />
        </Card>
      </Container>
    </Fragment>
  );
};

export default ZktecoUsers;