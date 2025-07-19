import React from 'react';
import { Modal, Button } from 'antd';

const ConfirmationModal = ({ visible, onClose, onConfirm,message }) => {
    console.log("kjfsdkjkjfsd",visible, onClose, onConfirm,message)
  return (
    <Modal
      title={ 'Confirm Action'}
      visible={visible}
      onCancel={onClose}
      onOk={onConfirm}
      okText="Yes"
      cancelText="No"
    >
      <p>{message || 'Are you sure you want to proceed?'}</p>
    </Modal>
  );
};

export default ConfirmationModal;
