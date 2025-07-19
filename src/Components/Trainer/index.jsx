import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Image, Space, Button, Tag, Modal, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector, batch } from "react-redux";
import { fetchUsersNew } from "../../Redux/slices/allUsers";
import { toast } from "react-toastify";
import bannersService from "../../Services/banner";
import { BASE_URL } from "../../Config/AppConstant";
import usersService from "../../Services/users";
import attendanceService from "../../Services/attendance";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { fetchTrainers } from "../../Redux/slices/trainers";

const Trainers = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewData, setViewData] = useState("");
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [userAttendance, setUserAttendance] = useState(null);
  const [markAttendance, setMarkAttendance] = useState("present");
  const dispatch = useDispatch();
  const { loading, error, pagination, trainers } = useSelector(
    (state) => state.trainers
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = () => {
    dispatch(
      fetchTrainers({
        page: currentPage,
        limit: pageSize,
      })
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleDelete = async (id) => {
    try {
      await bannersService.delete(id);
      toast.success("User deleted successfully!");
      fetchUsers(); // Refetch users after deletion
    } catch (error) {
      toast.error(error.message || "Failed to delete user.");
    }
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      render: (_, __, index) => {
        return <div>{(currentPage - 1) * pageSize + index + 1}</div>;
      },
    },
    {
      title: "First Name",
      dataIndex: "name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      render: (active) => (
        <div>
          {active===null?'N/A':active}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Gym",
      dataIndex: "gym_user_name",
    },
    {
      title: "Joining Date",
      dataIndex: "created_at",
      render: (date) => (
        <Tag color={"green"}>
          {new Date(date).toLocaleDateString()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (active) => (
        <Tag color={active === 1 ? "green" : "red"}>
          {active === 1 ?"Active":"Unactive"}
        </Tag>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      render: (active) => (
        <Tag color={"cyan"}>
          {active}
        </Tag>
      ),
    },
    {
      title: "Available",
      dataIndex: "available",
      render: (active) => (
        <Tag color={active ===2 ? "red" : "green"}>
          {active ===2 ?'Not Available' :'Available'}
        </Tag>
      ),
    },
    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {navigate(`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`)}}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              handleDelete(row.id);
            }}
          />
        </Space>
      ),
    },
  ];

  const onChangePagination = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleAttendanceChange = (value) => {
    setMarkAttendance(value);
  };

  const handleEditAttendance = async (id) => {
    try {
      // console.log(userAttendance.id,{'status': markAttendance , "type":"admin"})
      await attendanceService.update(userAttendance.id, {
        status: markAttendance,
        type: "admin",
      }); // Assuming `category.id` is the identifier
      toast.success("Attendance updated successfully!");
      batch(() => {
        dispatch(fetchUsersNew(currentPage, 10));
        setAttendanceModal(false);
      });
      setEditModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to update banner.");
      setAttendanceModal(false);
    }
  };

  const Modaltoggle = () => {
    setAddModal(!addModal);
  };

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Trainer" parent="Apps" title="Trainer" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Trainer (${pagination.total})`}
          extra={
            <Btn
              attrBtn={{
                color: "success",
                onClick: () => navigate(`${process.env.PUBLIC_URL}/trainer/add/${layoutURL}`),
              }}
            >
              <span>
                <i className="fa fa-plus-circle text-white me-2"></i>
              </span>
              Add Trainer
            </Btn>
            // <Button
            //   type="primary"
            //   icon={<PlusCircleOutlined />}
            //   onClick={() => (true)}
            // >
            //   Add User
            // </Button>
          }
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={trainers}
            pagination={{
              current: pagination.currentPage || currentPage,
              pageSize: pagination.limit || pageSize,
              total: pagination.total || 0,
              showSizeChanger: true,
            }}
            onChange={onChangePagination}
            rowKey={(record) => record.id}
          />

          <Modal
            title="Mark Attendance"
            open={attendanceModal}
            // onOk={handleOk}
            footer={null}
            onCancel={() => setAttendanceModal(false)}
            centered
          >
            <hr />
            <Select
              defaultValue="present"
              value={markAttendance}
              style={{ width: "100%" }}
              onChange={handleAttendanceChange}
              options={[
                { value: "present", label: "Present" },
                { value: "absent", label: "Absent" },
                { value: "late", label: "Late" },
              ]}
            />
            <hr />
            <div className="d-flex justify-content-end">
              <Button
                type="primary"
                className="mx-3"
                onClick={handleEditAttendance}
                // loading={loading}
              >
                Update
              </Button>
              <Button
                onClick={() => {
                  // setIsModalVisible(false);
                  // setText([]);
                  // setActive(null);
                  // setVerify(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Modal>
        </Card>
      </Container>
    </Fragment>
  );
};


export default Trainers;