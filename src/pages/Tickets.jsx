import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, message, Tabs, Tooltip, Modal } from "antd";
import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets, resolveTicket } from "../store/ticketSlice";

const Tickets = () => {
  const dispatch = useDispatch();
  const { items: ticketList, loading } = useSelector((state) => state.tickets);
  const [activeTab, setActiveTab] = useState("PENDING");

  useEffect(() => {
    dispatch(fetchTickets({ status: activeTab }));
  }, [dispatch, activeTab]);

  const handleResolve = (id) => {
    Modal.confirm({
      title: "Xác nhận xử lý",
      content: "Bạn có chắc chắn muốn đánh dấu báo cáo này là ĐÃ GIẢI QUYẾT?",
      onOk: async () => {
        try {
          await dispatch(resolveTicket({ id, status: "RESOLVED" })).unwrap();
          message.success("Đã cập nhật trạng thái ticket");
        } catch (error) {
          message.error(error || "Lỗi khi xử lý");
        }
      },
    });
  };

  const handleReject = (id) => {
    Modal.confirm({
      title: "Từ chối báo cáo",
      content: "Đánh dấu báo cáo này là KHÔNG HỢP LỆ (Từ chối)?",
      okType: "danger",
      onOk: async () => {
        try {
          await dispatch(resolveTicket({ id, status: "REJECTED" })).unwrap();
          message.success("Đã từ chối ticket");
        } catch (error) {
          message.error(error || "Lỗi khi xử lý");
        }
      },
    });
  };

  const columns = [
    {
      title: "Người báo cáo",
      dataIndex: "reporter",
      key: "reporter",
      render: (user) => (
        <span style={{ fontWeight: 500 }}>{user?.displayName}</span>
      ),
    },
    {
      title: "Loại vi phạm",
      dataIndex: "reportType",
      key: "reportType",
      render: (type) => (
        <Tag color={type === "EVENT" ? "blue" : "purple"}>
          {type === "EVENT" ? "Sự kiện" : "Người dùng"}
        </Tag>
      ),
    },
    {
      title: "Đối tượng bị báo cáo",
      key: "target",
      render: (_, record) => {
        if (record.reportType === "EVENT") {
          return (
            <span>
              Event: <b>{record.reportedEvent?.title || "Không xác định"}</b>
            </span>
          );
        }
        return (
          <span>
            User: <b>{record.reportedUser?.displayName || "Không xác định"}</b>
          </span>
        );
      },
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: "30%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "RESOLVED") color = "success";
        if (status === "PENDING") color = "warning";
        if (status === "REJECTED") color = "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "PENDING" && (
            <>
              <Tooltip title="Đã xử lý xong">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleResolve(record._id)}
                />
              </Tooltip>
              <Tooltip title="Báo cáo sai/Từ chối">
                <Button
                  danger
                  shape="circle"
                  icon={<StopOutlined />}
                  onClick={() => handleReject(record._id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "RESOLVED", label: "Đã giải quyết" },
    { key: "REJECTED", label: "Đã từ chối" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý Báo cáo vi phạm</h2>

      <Tabs
        defaultActiveKey="PENDING"
        items={tabItems}
        onChange={(key) => setActiveTab(key)}
      />

      <Table
        columns={columns}
        dataSource={ticketList}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Tickets;
