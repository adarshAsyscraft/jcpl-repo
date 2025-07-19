import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table,Button, Tag, Modal, Select } from "antd";
import { toast } from "react-toastify";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import trainersService from "../../Services/trainer";
import { MdOutlineArrowRightAlt } from "react-icons/md";

const TrainerBookingHistory = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [allData, setAllData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = () => {
    setLoading(true);
    trainersService
      .getAllBookings({ page: currentPage, limit: pageSize })
      .then((res) => {
        // console.log(res.data);
        setAllData(res.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        toast.error("Failed to fetch data");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);


  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      render: (_, __, index) => {
        return <div>{(currentPage - 1) * pageSize + index + 1}</div>;
      },
    },
    {
      title: "User Name",
      dataIndex: "user_name",
    },
    {
      title: "User Email",
      dataIndex: "user_email",
    },
    {
      title: "Trainer Name",
      dataIndex: "trainer_name",
    },
    {
      title: "Trainer Email",
      dataIndex: "trainer_email",
    },
    {
      title: "Booking Date",
      dataIndex: "booking_date",
      render: (date) => (
        <Tag color={"cyan"}>{new Date(date).toLocaleDateString()}</Tag>
      ),
    },
    {
      title: "Booking Time",
      dataIndex: "booking_date",
      render: (date,data ) => (
        <>
          {" "}
          <Tag color={"green"}>{data?.start_time}</Tag>{" "}
          <MdOutlineArrowRightAlt /> <Tag color={"green"}>{data?.end_time}</Tag>
        </>
      ),
    },
    {
      title: "Status",
      render: () => <Tag color={"green"}>Booked</Tag>,
    },
    // {
    //   title: "Options",
    //   dataIndex: "options",
    //   render: (_, row) => (
    //     <Space>
    //       <Button
    //         icon={<EditOutlined />}
    //         onClick={() => {
    //           navigate(
    //             `${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`
    //           );
    //         }}
    //       />
    //       <Button
    //         icon={<DeleteOutlined />}
    //         onClick={() => {
    //           handleDelete(row.id);
    //         }}
    //       />
    //     </Space>
    //   ),
    // },
  ];

  const onChangePagination = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };


  return (
    <Fragment>
      <Breadcrumbs mainTitle="Booking" parent="Apps" title="Booking" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={`Booking History (${allData?.pagination?.total})`}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={allData?.bookings}
            pagination={{
              current: allData?.pagination?.currentPage || currentPage,
              pageSize: allData?.pagination?.limit || pageSize,
              total: allData?.pagination?.total || 0,
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

export default TrainerBookingHistory;
