import React, { useEffect, useState } from "react";
import {
  Table,
  Avatar,
  Input,
  Tag,
  Button,
  Select,
  Modal,
  message,
  Tooltip,
  Space,
  Row,
  Col,
} from "antd";
import {
  StopOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  updateUserStatus,
  updateUserRole,
} from "../store/userSlice";
import { adminApi } from "../services/api";

const CITIES = [
  { value: "", label: "Tất cả khu vực" },
  { value: "Hồ Chí Minh", label: "Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Cần Thơ", label: "Cần Thơ" },
  { value: "Hải Phòng", label: "Hải Phòng" },
];

const Users = () => {
  const dispatch = useDispatch();
  const {
    items: userList,
    loading,
    pagination,
  } = useSelector((state) => state.users);

  const [keyword, setKeyword] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [banReason, setBanReason] = useState("");

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchUsers({
          page: 1,
          limit: 10,
          keyword,
          city: filterCity,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, keyword, filterCity]);

  const handleTableChange = (newPagination) => {
    dispatch(
      fetchUsers({
        page: newPagination.current,
        limit: newPagination.pageSize,
        keyword,
        city: filterCity,
      }),
    );
  };

  const handleViewHistory = async (record) => {
    setViewingUser(record);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryData([]);

    try {
      const res = await adminApi.getUserHistory(record._id);
      setHistoryData(res.data.history);
    } catch (error) {
      message.error("Không tải được lịch sử hoạt động");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChangeRole = (id, newRole) => {
    dispatch(updateUserRole({ id, role: newRole }))
      .unwrap()
      .then(() => message.success("Cập nhật vai trò thành công"))
      .catch((err) => message.error(err));
  };

  const handleUnban = (id) => {
    dispatch(updateUserStatus({ id, status: "ACTIVE" }))
      .unwrap()
      .then(() => message.success("Đã mở khóa tài khoản"))
      .catch((err) => message.error(err));
  };

  const openBanModal = (id) => {
    setSelectedUserId(id);
    setBanReason("");
    setIsBanModalOpen(true);
  };

  const handleBanSubmit = () => {
    if (!banReason) return message.warning("Vui lòng nhập lý do khóa");
    dispatch(
      updateUserStatus({
        id: selectedUserId,
        status: "BANNED",
        reason: banReason,
      }),
    )
      .unwrap()
      .then(() => {
        message.success("Đã khóa tài khoản");
        setIsBanModalOpen(false);
      })
      .catch((err) => message.error(err));
  };

  const columns = [
    {
      title: "User",
      key: "user",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={record.avatar} size="large" />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.displayName}</div>
            <div style={{ fontSize: 12, color: "gray" }}>
              {record.profile?.city || "Chưa cập nhật KV"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Điểm tích lũy",
      key: "points",
      render: (_, record) => (
        <Tag color="gold" style={{ fontWeight: "bold" }}>
          {record.gamification?.points || 0} điểm
        </Tag>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select
          defaultValue={role}
          style={{ width: 140 }}
          onChange={(val) => handleChangeRole(record._id, val)}
          options={[
            { value: "VOLUNTEER", label: "Volunteer" },
            { value: "ORGANIZATION", label: "Organization" },
            { value: "ADMIN", label: "Admin" },
          ]}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "BANNED" ? "red" : "green"}>
          {status || "ACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {/* [MỚI] Nút xem lịch sử */}
          <Tooltip title="Xem lịch sử hoạt động">
            <Button
              shape="circle"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>

          {record.status === "BANNED" ? (
            <Tooltip title="Mở khóa">
              <Button
                type="primary"
                ghost
                shape="circle"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUnban(record._id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Khóa tài khoản">
              <Button
                danger
                shape="circle"
                icon={<StopOutlined />}
                onClick={() => openBanModal(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Sự kiện",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Thời gian",
      dataIndex: "startTime",
      render: (time) => new Date(time).toLocaleDateString("vi-VN"),
    },
    {
      title: "Vai trò / Trạng thái",
      dataIndex: "participationRole",
      render: (role) => {
        if (role === "ORGANIZER")
          return <Tag color="purple">⭐ Ban tổ chức</Tag>;
        if (role === "PRESENT") return <Tag color="green">✅ Đã tham gia</Tag>;
        return <Tag color="orange">⏳ Đã đăng ký</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Quản lý Người dùng</h2>

      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          border: "1px solid #f0f0f0",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên..."
              prefix={<SearchOutlined style={{ color: "#ccc" }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn khu vực"
              options={CITIES}
              value={filterCity}
              onChange={(val) => setFilterCity(val)}
              allowClear
            />
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={userList}
        rowKey="_id"
        loading={loading}
        pagination={{
          total: pagination.total,
          current: pagination.page,
          pageSize: pagination.limit,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Khóa tài khoản người dùng"
        open={isBanModalOpen}
        onOk={handleBanSubmit}
        onCancel={() => setIsBanModalOpen(false)}
        okText="Khóa ngay"
        okButtonProps={{ danger: true }}
      >
        <p>Hành động này sẽ ngăn người dùng đăng nhập.</p>
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do khóa..."
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
      </Modal>

      <Modal
        title={
          <Space>
            <HistoryOutlined /> Lịch sử hoạt động: {viewingUser?.displayName}
          </Space>
        }
        open={isHistoryOpen}
        onCancel={() => setIsHistoryOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        <Table
          dataSource={historyData}
          columns={historyColumns}
          rowKey="_id"
          loading={historyLoading}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default Users;
