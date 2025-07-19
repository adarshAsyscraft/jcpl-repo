import React, { useState, useEffect, Fragment, useContext } from "react";
import { Card, Table,Button, Tag, Modal, Select } from "antd";
import { toast } from "react-toastify";
import { Breadcrumbs, Btn } from "../../AbstractElements";
import { Container } from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import trainersService from "../../Services/trainer";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import packagesService from "../../Services/package";

const PackagesBookingHistory = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [allData, setAllData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = () => {
    setLoading(true);
    packagesService
      .getBuyPackage({ page: currentPage, limit: pageSize })
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
      width: 50,
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
      title: "Package Title",
      dataIndex: "package_title",
    },
    {
      title: "Package Title/Duration",
      dataIndex: "package_price",
      render: (index,data) => (
        <div>{data.package_title}/{data.package_duration} months</div>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      render: (amount) => (
        <Tag color={"cyan"}>{Math.round(amount)}</Tag>
      ),
    },
    {
      title: "Paid Amount",
      dataIndex: "amount",
      render: (amount) => (
        <Tag color={"cyan"}>{Math.round(amount)}</Tag>
      ),
    },
    {
      title: "Due Amount",
      dataIndex: "amount",
      render: (amount, data) => (
       <><Tag color={"purple"}>{Math.round(data.due_amount)}</Tag></> 
      ),
    },
    {
      title: "Due Payment Date",
      dataIndex: "due_payment_date",
      render: (date ) => (
          <Tag color={"cyan"}>{new Date(date).toLocaleDateString()}</Tag>
      ),
    },
    {
      title: "Purchase Date",
      dataIndex: "created_at",
      render: (date ) => (
          <Tag color={"cyan"}>{new Date(date).toLocaleDateString()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex:"status",
      render: (data) => <Tag color={data==='pending'? "yellow":"blue"}>{data}</Tag>,
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
          title={`Booking (${allData?.pagination?.totalRecords})`}>
          <Table
            loading={loading}
            columns={columns}
            dataSource={allData?.packages}
            pagination={{
              current: allData?.pagination?.currentPage || currentPage,
              pageSize: allData?.pagination?.limit || pageSize,
              total: allData?.pagination?.totalRecords || 0,
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

export default PackagesBookingHistory;
