'use client';

import React from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Calendar,
  Layers,
  Tv
} from 'lucide-react';

interface AddSessionModalProps {
  open: boolean;
  onCancel: () => void;
}

export default function AddSessionModal({ open, onCancel }: AddSessionModalProps) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    message.success('Session created successfully.');
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={<span className="font-heading text-lg font-bold text-foreground">Add New Session</span>}
      onCancel={onCancel}
      footer={null}
      width={480}
      centered
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="space-y-4 pt-4"
      >
        <Form.Item
          label={<span className="font-bold text-on-surface-variant text-xs">Session Title</span>}
          name="title"
          rules={[{ required: true, message: 'Please enter a session title' }]}
        >
          <Input placeholder="e.g. Scaling Web3 Architecture" className="h-10 rounded-lg" />
        </Form.Item>

        <Form.Item
          label={<span className="font-bold text-on-surface-variant text-xs">Speaker</span>}
          name="speaker"
          rules={[{ required: true, message: 'Please select a speaker' }]}
        >
          <Select placeholder="Select a speaker" className="h-10 rounded-lg">
            <Select.Option value="sarah">Sarah Jenkins</Select.Option>
            <Select.Option value="jordan">Jordan Lee</Select.Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">Time</span>}
            name="time"
            rules={[{ required: true, message: 'Please enter time' }]}
          >
            <Input placeholder="09:00 AM" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-on-surface-variant text-xs">Duration</span>}
            name="duration"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Select defaultValue="60" className="h-10 rounded-lg">
              <Select.Option value="30">30 Min</Select.Option>
              <Select.Option value="45">45 Min</Select.Option>
              <Select.Option value="60">60 Min</Select.Option>
              <Select.Option value="90">90 Min</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="font-bold text-on-surface-variant text-xs">Track / Location</span>}
          name="location"
          rules={[{ required: true, message: 'Please select a track' }]}
        >
          <Select defaultValue="main" className="h-10 rounded-lg">
            <Select.Option value="main">Main Stage</Select.Option>
            <Select.Option value="workshop">Workshop Room A</Select.Option>
            <Select.Option value="networking">Networking Hub</Select.Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onCancel} className="h-10 rounded-lg font-bold px-6">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className="h-10 rounded-lg bg-primary border-none font-bold px-6">
            Create Session
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
