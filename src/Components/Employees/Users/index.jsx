import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Image, Space, Button, Tag, Modal, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector, batch } from "react-redux";
import { fetchUsersNew } from "../../../Redux/slices/allUsers";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import { toast } from "react-toastify";
import bannersService from "../../../Services/banner";
import { BASE_URL } from "../../../Config/AppConstant";
import usersService from "../../../Services/users";
import attendanceService from "../../../Services/attendance";
import goalsService from "../../../Services/goals";
import { FaRegEye } from "react-icons/fa";
import trainersService from "../../../Services/trainer";

const Users = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewData, setViewData] = useState("");
  const [modal, setModal] = useState(false);
  const [userAttendance, setUserAttendance] = useState(null);
  const [markAttendance, setMarkAttendance] = useState("present");
  const dispatch = useDispatch();
  // const { loading, error, pagination, allUsers } = useSelector(
  //   (state) => state.allUsers
  // );
  const [expiryData, setExpiryData] = useState([]);
  const [expiryPage, setExpiryPage] = useState(1);
  const [expiryTotal, setExpiryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [days, setDays] = useState("30");
  const [goals, setGoals] = useState([]);
  const [modalData, setModalData] = useState([]);

  // const fetchUsers = useCallback(() => {
  //   dispatch(
  //     fetchUsersNew({
  //       page: currentPage,
  //       limit: pageSize,
  //       roles: "[4]",
  //     })
  //   );
  // }, [dispatch, currentPage, pageSize]);

  // useEffect(() => {
  //   fetchUsers();
  // }, [fetchUsers]);

  const getDetails = async (orderDirection, page, setData, setTotal, days) => {
    setLoading(true);
    try {
      const response = await trainersService.getAll({
        page,
        limit: pageSize,
      });

      setData(response.data?.trainers || []);
      setTotal(response.data?.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetails("DESC", expiryPage, setExpiryData, setExpiryTotal, days);
  }, [expiryPage, pageSize, days]);

  const handleDelete = async (id) => {
    try {
      await bannersService.delete(id);
      toast.success("User deleted successfully!");
      // fetchUsers(); // Refetch users after deletion
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
      title: "Profile Pic",
      dataIndex: "image",
      render: (img, data) => (
        <Image
          width={60}
          height={60}
          src={
            img
              ? `${BASE_URL}/${img}`
              : data.gender === "female"
              ? require("../../../assets/images/female-avatar.png")
              : require("../../../assets/images/male-avatar.png")
          }
          style={{ borderRadius: 4, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Job Title",
      dataIndex: "role",
      render: (data) => (
        <Tag color={"cyan"}>{data === 4 ? "Trainer" : "Trainer"}</Tag>
      ),
    },
    {
      title: "Assigned Clients",
      dataIndex: "users",
      render: (datas) => {
        return (
          <div
            onClick={() => {
              setModal(!modal);
              setModalData(datas); 
              console.log(datas)
            }}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Tag color="cyan">{datas.length}</Tag> 
            <FaRegEye style={{ marginLeft: '8px' }} />
          </div>
        );
      },
    }
    ,
    {
      title: "Availability",
      dataIndex: "available",
      render: (active) => (
        <Tag color={active === 1 ? "green" : "red"}>
          {active === 1 ? "Available" : "Unavailable"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            // onClick={() => {navigate(`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`)}}
          />
          <Button
            icon={<DeleteOutlined />}
            // onClick={() => {
            //   handleDelete(row.id);
            // }}
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
      await attendanceService.update(userAttendance.id, {
        status: markAttendance,
        type: "admin",
      }); // Assuming `category.id` is the identifier
      toast.success("Attendance updated successfully!");
      batch(() => {
        dispatch(fetchUsersNew(currentPage, 10));
        // setAttendanceModal(false);
      });
      setEditModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to update banner.");
      // setAttendanceModal(false);
    }
  };

  const Modaltoggle = () => {
    setAddModal(!addModal);
  };

  const fetchGoals = () => {
    goalsService
      .getAll()
      .then((res) => {
        // console.log(res?.data)
        if (Array.isArray(res?.data)) {
          setGoals(res?.data);
        } else {
          console.error("Fetched goals data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <Card title={`Users (${expiryTotal})`}>
      <Table
        loading={loading}
        columns={columns}
        dataSource={expiryData}
        pagination={{
          current: expiryPage,
          pageSize,
          total: expiryTotal,
          showSizeChanger: true,
          onChange: (page, size) => {
            setExpiryPage(page);
            setPageSize(size);
          },
        }}
        rowKey={(record) => record.id}
      />

      <AddModal
        viewModal={addModal}
        setViewModal={setAddModal}
        currentPage={currentPage}
        Modaltoggle={Modaltoggle}
      />
      <EditModal
        category={viewData}
        editModal={editModal}
        setEditModal={setEditModal}
      />

      <Modal
        title="Users List"
        open={modal}
        // onOk={handleOk}
        footer={null}
        onCancel={() => setModal(false)}
        centered
      >
        <hr />

        <div className="table-responsive">
        <table class="table table-striped">
            <thead>
              <tr>
                <th scope="col">{"ID"}</th>
                <th scope="col">{"Name"}</th>
              </tr>
            </thead>
            <tbody>
              {modalData?.map((item) => (
                <tr key={item.id}>
                  <th scope="row">{item.id}</th>
                  <td>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </Card>
  );
};

export default Users;
