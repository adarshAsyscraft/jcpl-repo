import React, { Fragment, useState, useEffect } from "react";
import { Container } from "reactstrap";
import { Breadcrumbs, Btn, P } from "../../AbstractElements";
import { Badge, Button, Card, Col, Row, Space, Spin } from "antd";
import {
  EditOutlined,
  PlusCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import PackagesAddModal from "./PackagesAdd";
import PackagesEditModal from "./PackagesEdit";
import packagesService from "../../Services/package";

const Packages = () => {
  const [add, setAdd] = useState(null);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const colCount = data.length;
  const dispatch = useDispatch();
  // const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const fetchSubscriptionList = () => {
    setLoading(true);
    packagesService
      .getAll()
      .then((res) => {
        console.log(res.data);
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscriptionList();
    console.log("data", data);
  }, []);

  return (
    <Fragment>
      <Breadcrumbs mainTitle="Packages" parent="Pages" title="Packages" />
      <Container fluid={true}>
        <Card
          className="h-100 shadow-lg rounded-lg p-4"
          extra={
            <Space>
              <Btn
                attrBtn={{
                  color: "success",
                  onClick: () => setAdd(true),
                }}
              >
                <span>
                  <i className="fa fa-plus-circle text-white me-2"></i>
                </span>
                Add Package
              </Btn>
            </Space>
          }
        >
          {!loading ? (
            <Row gutter={[16, 16]} justify="center">
              {data.map((elm, i) => (
                <Col key={`price-column-${i}`} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    className="border rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-xl"
                    hoverable
                  >
                    <div className="px-4 text-center">
                      <h1 className="text-4xl font-bold text-blue-500">
                        {elm.price}₹
                      </h1>
                      <h6 className="text-gray-500 text-sm">
                        {elm.duration} month
                      </h6>
                    </div>

                    <div className="mt-4">
                      <h4
                        className="text-center font-semibold text-md text-blue-600 cursor-pointer hover:underline"
                        onClick={() => setEdit(elm)}
                      >
                        {elm.title} <EditOutlined />
                      </h4>
                    </div>

                    <div className="mt-4 text-gray-700 text-sm">
                      {elm?.details?.map((detail, i) => (
                        <p
                          key={`pricing-feature-${i}`}
                          className="flex items-center gap-2"
                        >
                          <CheckCircleFilled style={{color:"green", fontWeight:"bold", marginRight:"5px"}} />
                          <span>{detail}</span>
                        </p>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" style={{ color: "#1890ff" }} />
            </div>
          )}
        </Card>
        {edit && (
          <PackagesEditModal
            modal={edit}
            handleCancel={() => setEdit(null)}
            refetch={fetchSubscriptionList}
          />
        )}
        {add && (
          <PackagesAddModal
            modal={add}
            handleCancel={() => setAdd(null)}
            refetch={fetchSubscriptionList}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default Packages;
