import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Switch,
  Space,
  Divider,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import packagesService from '../../Services/package';
import Loader from '../../Layout/Loader';

export default function PackagesEditModal({ modal, handleCancel, refetch }) {
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (modal) {
      setLoading(true);
      // Fetch package details (if needed) or directly use modal data
      form.setFieldsValue({
        title: modal.title || '',
        duration: modal.duration || 1,
        price: modal.price || 0,
        cut_price: modal.cut_price || 0,
        status: Boolean(modal.status),
        details: modal.details?.map((detail) => ({ detail })) || [{}], // Ensure array format
      });
      setLoading(false);
    }
  }, [modal, form]);

  const onFinish = (values) => {
    const payload = {
      ...values,
      status: Number(values.status),
      details: values.details.map((item) => item.detail),
    };

    setLoadingBtn(true);
    packagesService
      .update(modal.id, payload)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      open={!!modal}
      title="Edit Package"
      onCancel={handleCancel}
      style={{ minWidth: 800 }}
      footer={[
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={loadingBtn}
          key="save-btn"
        >
          Save
        </Button>,
        <Button type="default" onClick={handleCancel} key="cancel-btn">
          Cancel
        </Button>,
      ]}
    >
      <Divider />
      {loading ? (
        <Loader />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'This field is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Duration (Months)"
                name="duration"
                rules={[{ required: true, message: 'This field is required' }]}
              >
                <InputNumber min={1} max={12} className="w-100" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: 'This field is required' }]}
              >
                <InputNumber min={0} className="w-100" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Cut Price"
                name="cut_price"
                rules={[{ required: true, message: 'This field is required' }]}
              >
                <InputNumber min={0} className="w-100" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Details">
                <Form.List name="details">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'detail']}
                            rules={[{ required: true, message: 'Enter a detail' }]}
                          >
                            <Input placeholder="Enter detail" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Detail
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
