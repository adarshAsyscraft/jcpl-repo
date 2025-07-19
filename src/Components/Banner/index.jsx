import React, { Fragment, useContext, useState } from "react";
import { Plus } from "react-feather";
import { CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { Breadcrumbs, H5, Btn } from "../../AbstractElements";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Card, Table, Image, Space, Button, Tag } from "antd";
import {batch, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchBanners } from "../../Redux/slices/banners";
import { BASE_URL } from "../../Config/AppConstant";
import DeleteButton from "../Buttons/delete-button";
import SearchInput from "../Buttons/search-input";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import { toast } from "react-toastify";
import bannersService from "../../Services/banner";

const Banner = () => {
  const [addModal, setAddModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [viewData, setViewData] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  // const { bookings } = useSelector((state) => state.bookings);
  const dispatch = useDispatch();
  // const { loading, users, error, pagination } = useSelector(
  //   (state) => state.userState
  // );

  const { loading, error, pagination, banners } = useSelector(
    (state) => state.banners
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(5);

  const EditModaltoggle = (data) => {
    setViewData(data);
    setEditModal(!editModal);
  };
  const Modaltoggle = () => setViewModal(!viewModal);

  useEffect(() => {
    dispatch(fetchBanners(currentPage, 10)); // Fetch users for the current page with a limit of 10
  }, [dispatch, currentPage]);

  function handleModalData(data) {
    setViewData(data); // Set the data object
    setEditModal(true);
  }


  const handleDelete = async (id) => {

    try {
      await bannersService.delete(id);
      toast.success("Banner deleted successfully!");
      batch(() => {
        dispatch(fetchBanners(currentPage, 10));
      });
    } catch (error) {
      toast.error(error.message || "Failed to delete banner.");
    }
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serial",
      is_show: true,
      render: (_, __, index) => {
        return <div>{(currentPage - 1) * pageSize + index + 1}</div>;
      },
    },
    {
      title: "Image",
      dataIndex: "image",
      is_show: true,
      render: (img) => {
        return (
          <Image
            width={60}
            height={60}
            src={`${BASE_URL}/${img}`}
            placeholder
            style={{ borderRadius: 4, objectFit: "cover" }}
          />
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      is_show: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      is_show: true,
      render: (active) => {
        return (
          <div>
            {active === "active" ? (
              <Tag color="green">Active</Tag>
            ) : (
              <Tag color="error">Deactive</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Options",
      dataIndex: "options",
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                handleModalData(row);
              }}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                handleDelete(row.id);
              }}
            />
          </Space>
        );
      },
    },
  ];

  function onChangePagination(pagination) {
    // Typing for pagination
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);
  }
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Banner" parent="Apps" title="Banner" />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Card
          title={"Banner"}
          extra={
            <Space wrap>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={Modaltoggle}
                >
                  Add Banner
                </Button>
                {/* <DeleteButton size="">{"delete.selected"}</DeleteButton> */}
              </Space>
            </Space>
          }
        >
          {/* <div className="d-flex justify-content-between">
            <SearchInput
              placeholder={"search"}
              className="w-25"
              //   handleChange={(e) => handleFilter({ search: e })}
              //   defaultValue={activeMenu.data?.search}
              //   resetSearch={!activeMenu.data?.search}
            />
          </div> */}

          <Table
            scroll={{ x: true }}
            loading={loading}
            columns={columns?.filter((item) => item.is_show)}
            dataSource={banners}
            pagination={{
              pageSize,
              total: banners?.length,
              current: currentPage,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={onChangePagination}
            rowKey={(record) => record.id}
          />

          <AddModal
            viewModal={viewModal}
            setViewModal={setViewData}
            Modaltoggle={Modaltoggle}
            currentPage={currentPage}
          />
          <EditModal
            category={viewData}
            editModal={editModal}
            setEditModal={setEditModal}
            EditModaltoggle={EditModaltoggle}
          />
          {/* <CustomModal
        click={userDelete}
        text={t('delete')}
        loading={loadingBtn}
        setText={setId}
      />
      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )} */}
        </Card>
      </Container>
    </Fragment>
  );
};
export default Banner;
