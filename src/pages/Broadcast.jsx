import React, { useState } from "react";
import { Card, Form, Input, Button, message, Result } from "antd";
import { SoundOutlined } from "@ant-design/icons";
import { adminApi } from "../services/api";

const Broadcast = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await adminApi.broadcastNotification(values);
      message.success("Đã gửi thông báo thành công!");
      form.resetFields();
    } catch (error) {
      message.error("Gửi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>
        <SoundOutlined /> Gửi Thông báo Hệ thống
      </h2>
      <p style={{ color: "gray", marginBottom: 20 }}>
        Tin nhắn này sẽ được gửi tới <b>tất cả</b> người dùng và hiển thị ngay
        lập tức trên ứng dụng.
      </p>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Ví dụ: Bảo trì hệ thống" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <Input.TextArea rows={5} placeholder="Nhập nội dung chi tiết..." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Gửi Thông Báo
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Broadcast;
