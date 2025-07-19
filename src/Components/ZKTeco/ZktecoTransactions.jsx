import React, { useState, useEffect, Fragment, useContext } from "react";
import { Tag, Table } from "antd";
import { Breadcrumbs } from "../../AbstractElements";
import { useNavigate } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { Card, Container } from "reactstrap";
import zktecoService from "../../Services/zkteco";

const ZktecoTransactions = () => {
  const { layoutURL } = useContext(CustomizerContext);
  const navigate = useNavigate();
  const [getUsers, setGetUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchZKtecoUsers = (page = 1, pageSize = 10) => {
    setLoading(true);
    zktecoService
      .getAllTransactions({ page, pageSize })
      .then((res) => {
        if (Array.isArray(res?.data?.data)) {
          setGetUsers(res?.data?.data);
          setPagination({
            current: page,
            pageSize: pageSize,
            total: res?.data?.count || 0,
          });
        } else {
          console.error("Fetched activity data is not an array", res?.data);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchZKtecoUsers(pagination.current, pagination.pageSize);
  }, []);

  const onChangePagination = (pagination) => {
    fetchZKtecoUsers(pagination.current, pagination.pageSize);
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
      title: "Device ID",
      dataIndex: "terminal_sn",
    },
    {
      title: "Device Name",
      dataIndex: "terminal_alias",
    },
    {
      title: "Employee Code",
      dataIndex: "emp_code",
    },
    {
      title: "Area",
      dataIndex: "area_alias",
      render: (active) => <Tag color={"cyan"}>{active}</Tag>,
    },
    {
      title: "Punch Time",
      dataIndex: "punch_time",
      render: (active) => <Tag color={"green"}>{active}</Tag>,
    },
    {
      title: "Upload Time",
      dataIndex: "upload_time",
      render: (active) => <Tag color={"green"}>{active}</Tag>,
    },
  ];

  return (
    <Fragment>
      <Breadcrumbs mainTitle="ZKTeco" parent="Apps" title="ZKTeco" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card>
          <Table
            loading={loading}
            columns={columns}
            dataSource={getUsers}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
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
export default ZktecoTransactions;
