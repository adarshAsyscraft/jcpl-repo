import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function DeleteButton({
  size = '',
  onClick,
  type = 'default',
  ...props
}) {


  return (
    <Button
      size={size}
      icon={<DeleteOutlined />}
      type={type}
      {...props}
    />
  );
}
