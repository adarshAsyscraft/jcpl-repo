import React, { useState, useEffect } from "react";
import { Card, Table, Image, Space, Button, Tag, Modal, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector, batch } from "react-redux";
import { fetchUsersNew } from "../../../Redux/slices/allUsers";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import { toast } from "react-toastify";   
import bannersService from "../../../Services/banner";
import { BASE_URL } from "../../../Config/AppConstant";
import usersService from "../../../Services/users";
import attendanceService from "../../../Services/attendance";
import { Btn } from "../../../AbstractElements";
import moment from "moment";
import packagesService from "../../../Services/package";
import { LiaSmsSolid } from "react-icons/lia";
import { MdOutlineAttachEmail } from "react-icons/md";
import { WhatsAppOutlined } from "@ant-design/icons";
import goalsService from "../../../Services/goals";

const Users = () => {
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewData, setViewData] = useState("");
  const [attendanceModal, setAttendanceModal] = useState(false);
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

  // const fetchUsers = () => {
  //   dispatch(
  //     fetchUsersNew({
  //       page: currentPage,
  //       limit: pageSize,
  //     })
  //   );
  // };

  // useEffect(() => {
  //   fetchUsers();
  // }, [currentPage, pageSize]);

  const getDetails = async (orderDirection, page, setData, setTotal, days) => {
    setLoading(true);
    try {
      const response = await usersService.getAllUsersForMembermangement({
        page,
        limit: pageSize,
        days,
      });

      setData(response.data?.users || []);
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
      title: "Image",
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
      title: "Member Name",
      dataIndex: "name",
    },
    {
      title: "Attendance Status",
      dataIndex: "",
      render: (data) => "N/A",
    },
    {
      title: "Membership Type",
      dataIndex: "packages",
      render: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          return data.map((detail, index) => (
            <Tag key={index} color="green">
              {detail.title}
            </Tag>
          ));
        } else {
          return <Tag color="red">No Plan</Tag>;
        }
      },
    },
    {
      title: "Payment Status",
      dataIndex: "packages",
      render: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          return data?.map((detail) => {
            const date = detail.due_payment_date;

            const expiryDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const daysDiff = Math.round(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            const statusConfig = [
              { condition: daysDiff === 0, color: "red", message: `Due today` },
              {
                condition: daysDiff === 1,
                color: "orange",
                message: `Due tomorrow`,
              },
              {
                condition: daysDiff < 0,
                color: "gray",
                message: `Overdue by ${Math.abs(daysDiff)} days`,
              },
              {
                condition: true,
                color: "blue",
                message: `Due in ${daysDiff} days`,
              }, // Default
            ];

            const { color, message } = statusConfig.find((s) => s.condition);

            return (
              <Tag color={color}>
                {message} ({expiryDate.toLocaleDateString("en-GB")})
              </Tag>
            );
          });
        } else {
          return <Tag color="red">No Plan</Tag>;
        }
      },
    },
    {
      title: "Trainer",
      dataIndex: "trainer_name",
      render: (data) => (data !== null ? data : "Not assign"),
    },
    {
      title: "Fitness Goals",
      dataIndex: "goal_ids",
      render: (data) => {
        if (data === null) return <Tag color="red">N/A</Tag>; // Handle null/undefined case

        let goalIds;
        try {
          goalIds = JSON.parse(data); // Ensure valid JSON parsing
        } catch (error) {
          console.error("Invalid JSON:", data);
          return <div>Error in Data</div>;
        }

        if (!Array.isArray(goalIds)) return <div>Invalid Goal Data</div>; // Ensure it's an array

        const filteredGoals = goals.filter((goal) => goalIds.includes(goal.id));
        // console.log(data , goalIds ,filteredGoals)
        return (
          <div>
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <Tag color="cyan" key={goal.id}>
                  {goal.goal_name}
                </Tag>
              ))
            ) : (
              <div>No Matching Goals</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Medical Concerns",
      dataIndex: "chronic_name",
      render: (data) => <Tag color="cyan">{data === null ? "N/A" : data}</Tag>,
    },
    // {
    //   title: "Date of Birth",
    //   dataIndex: "dob",
    //   render:(data)=><Tag color="cyan">{new Date(data).toLocaleDateString('en-CA') }</Tag>
    // },
    // {
    //   title: "Attendance",
    //   dataIndex: "attendance",
    //   key: "attendance",
    //   is_show: true,
    //   render: (status, row) => (
    //     // console.log(status),
    //     (
    //       <div>
    //         {status?.status === "present" ? (
    //           <Tag color="green">{status?.status}</Tag>
    //         ) : status?.status === "absent" ? (
    //           <Tag color="error">{status?.status}</Tag>
    //         ) : status?.status === "late" ? (
    //           <Tag color="cyan">{status?.status}</Tag>
    //         ) : (
    //           <Tag color="error">{"Absent"}</Tag>
    //         )}
    //         <EditOutlined onClick={() => {setUserAttendance(row); setAttendanceModal(true)}} />
    //       </div>
    //     )
    //   ),
    // },
    // {
    //   title: "Role",
    //   dataIndex: "role",
    //   render: (role) => {
    //     const roleMap = {
    //       '1': { label: "Admin", color: "green" },
    //       '2': { label: "User", color: "red" },
    //       '3': { label: "Gym Owner", color: "blue" },
    //       '4': { label: "Trainer", color: "yellow" },
    //     };
    //     const roleInfo = roleMap[role] || { label: "Inactive", color: "gray" };
    //     return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
    //   },
    // },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   render: (active) => (
    //     <Tag color={active === 1 ? "green" : "red"}>
    //       {active === 1 ? "Active" : "Inactive"}
    //     </Tag>
    //   ),
    // },
    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          <Button
            style={{ backgroundColor: "#14e763" }}
            icon={<WhatsAppOutlined style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
            }}
          />
          <Button
            style={{ backgroundColor: "#ffc107" }}
            icon={<MdOutlineAttachEmail style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
            }}
          />
          <Button
            style={{ backgroundColor: "#22a5db" }}
            icon={<LiaSmsSolid style={{ color: "white" }} />}
            onClick={() => {
              // Handle WhatsApp click
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
  );
};

export default Users;
