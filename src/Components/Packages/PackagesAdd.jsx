import React, { useState } from 'react';
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

export default function PackagesAddModal({ modal, handleCancel, refetch }) {
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);

  const onFinish = (values) => {
    const payload = {
      ...values,
      active: Number(values.active),
      with_report: Number(values.with_report),
      status: Number(values.status),
      details: values.details.map((item) => item.detail), // Convert to array
      type: 'shop',
    };

    setLoadingBtn(true);
    packagesService
      .create(payload)
      .then(() => {
        handleCancel();
        refetch();
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Modal
      open={!!modal}
      title="Add Package"
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
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          active: true,
          with_report: true,
          status: 1,
          details: [{}], // Initialize with an empty detail input
          ...modal,
        }}
      >
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
    </Modal>
  );
}
