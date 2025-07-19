import { Table, Tag } from "antd";
import React, { Fragment, useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { supportColumns, supportData } from "../../Data/SupportTicket";

const TicketTable = () => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const onChangePagination = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  const columns = [
    {
      title: "S No.",
      dataIndex: "serial",
      render: (_, __, index) => {
        return <div>{(currentPage - 1) * pageSize + index + 1}</div>;
      },
    },
    {
      title: "Ticket ID",
      dataIndex: "first_name",
    },
    {
      title: "Issue Type",
      dataIndex: "last_name",
    },
    {
      title: "Assigned To",
      dataIndex: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (active) => <Tag color={active ? "green" : "red"}>{active}</Tag>,
    },
    {
      title: "Last Update",
      dataIndex: "follow_up_status",
    },
    {
      title: "Options",
      dataIndex: "options",
      //   render: (_, row) => (
      //     <Space>
      //       <Button
      //         icon={<EditOutlined />}
      //         onClick={() => {navigate(`${process.env.PUBLIC_URL}/lead/edit/${row.uuid}/${layoutURL}`)}}
      //       />
      //       <Button
      //         icon={<DeleteOutlined />}
      //         onClick={() => {
      //           handleDelete(row.id);
      //         }}
      //       />
      //     </Space>
      //   ),
    },
  ];

  return (
    <Fragment>
      <div className="table-responsive support-table">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          // pagination={{
          //   current: pagination.currentPage || currentPage,
          //   pageSize: pagination.limit || pageSize,
          //   total: pagination.total || 0,
          //   showSizeChanger: true,
          // }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />


          <DataTable
                    columns={supportColumns}
                    data={supportData}
                    striped={true}
                    center={true}
                    pagination
                />
      </div>
    </Fragment>
  );
};
export default TicketTable;
