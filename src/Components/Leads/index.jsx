import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table, Image, Space, Button, Tag, Modal, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector, batch } from "react-redux";
import { fetchUsersNew } from "../../Redux/slices/allUsers";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import { toast } from "react-toastify";
import bannersService from "../../Services/banner";
import { BASE_URL } from "../../Config/AppConstant";
import usersService from "../../Services/users";
import attendanceService from "../../Services/attendance";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { fetchLeads } from "../../Redux/slices/leads";
import goalsService from "../../Services/goals";
import { MdOutlineAttachEmail } from "react-icons/md";
import { LiaSmsSolid } from "react-icons/lia";

const Leads = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewData, setViewData] = useState("");
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [userAttendance, setUserAttendance] = useState(null);
  const [markAttendance, setMarkAttendance] = useState("present");
  const dispatch = useDispatch();
  const { loading, error, pagination, leads } = useSelector(
    (state) => state.leads
  );
const [goals, setGoals] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = () => {
    dispatch(
      fetchLeads({
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
      title: "Lead Preferred Name",
      dataIndex: "first_name",
      render : (data , row)=> <Link to={`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`}>{data}</Link>
    },
    {
      title: "Interest level",
      dataIndex: "interest_level",
      render: (active) => (
        <Tag color={active ==='Hot' ? "red" : active==='Cold' ?'cyan' : "yellow"}>
        {active ==='Hot' ? "🔥" : active==='Cold' ?'❄️' : "🌡️"}  {active}
        </Tag>
      ),
    },
    {
      title: "Gym Timing",
      dataIndex: "preferred_gym_timing",
    },
    {
      title: "Fitness Goals",
      dataIndex: "goal_ids",
      render: (data) => {
        if (!data) return <div>No Goals</div>;
    
        let goalIds;
        try {
          goalIds = JSON.parse(data);
        } catch (error) {
          console.error("Invalid JSON:", data);
          return <div>Error in Data</div>;
        }
    
        if (!Array.isArray(goalIds)) return <div>Invalid Goal Data</div>;
    
        const filteredGoals = goals.filter((goal) => goalIds.includes(goal.id));
        return (
          <div>
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => <Tag color="cyan" key={goal.id}>{goal.goal_name}</Tag>)
            ) : (
              <div>No Matching Goals</div>
            )}
          </div>
        );
      }
    },
    {
      title: "Preferred Membership Plan",
      dataIndex: "",
      render:(data)=> 'N/A'
    },
    {
      title: "How They Heard About the Gym",
      dataIndex: "how_heard_about_gym",
      render:(data)=> data
    },
    {
      title: "Current Fitness Level",
      dataIndex: "current_fitness_level",
      render: (active) => (
        <Tag color={"warning"}>
          {active}
        </Tag>
      ),
    },
    {
      title: "Last Interaction",
      dataIndex: "updated_at",
      render:(data)=> new Date(data).toLocaleDateString('en-CA')
    },
    {
      title: "Follow up Status",
      dataIndex: "follow_up_status",
      render: (active) => (
        <Tag color={"cyan"}>
          {active}
        </Tag>
      ),
    },

    {
      title: "Options",
      dataIndex: "options",
      render: (_, row) => (
        <Space>
          {/* <Button
            icon={<EditOutlined />}
            onClick={() => {navigate(`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`)}}
          /> 
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              handleDelete(row.id);
            }}
          />*/}
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
    fetchGoals()
  }, [])

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Leads" parent="Apps" title="Leads" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Leads (${pagination.total})`}
          extra={
            <Btn
              attrBtn={{
                color: "success",
                onClick: () => navigate(`${process.env.PUBLIC_URL}/lead/add/${layoutURL}`),
              }}
            >
              <span>
                <i className="fa fa-plus-circle text-white me-2"></i>
              </span>
              Add Lead
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
            dataSource={leads}
            pagination={{
              current: pagination.currentPage || currentPage,
              pageSize: pagination.limit || pageSize,
              total: pagination.total || 0,
              showSizeChanger: true,
            }}
            onChange={onChangePagination}
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
      </Container>
    </Fragment>
  );
};
export default Leads;
