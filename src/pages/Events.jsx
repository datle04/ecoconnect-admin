import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  message,
  Tabs,
  Avatar,
  Tooltip,
  Image,
  Modal,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  approveEvent,
  rejectEvent,
  deleteEventForce,
} from "../store/eventSlice";

const CITIES = [
  { value: "", label: "Tất cả khu vực" },
  { value: "Hồ Chí Minh", label: "Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Cần Thơ", label: "Cần Thơ" },
  { value: "Hải Phòng", label: "Hải Phòng" },
];

const Events = () => {
  const dispatch = useDispatch();
  const {
    items: eventList,
    loading,
    pagination,
  } = useSelector((state) => state.events);

  const [activeTab, setActiveTab] = useState("PENDING_APPROVAL");

  const [keyword, setKeyword] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchEvents({
          status: activeTab,
          page: 1,
          limit: 10,
          city: filterCity,
          keyword: keyword,
        }),
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dispatch, activeTab, filterCity, keyword]);

  const handleTableChange = (newPagination) => {
    dispatch(
      fetchEvents({
        status: activeTab,
        page: newPagination.current,
        limit: newPagination.pageSize,
        city: filterCity,
        keyword: keyword,
      }),
    );
  };

  const openActionModal = (type, id) => {
    setActionType(type);
    setSelectedId(id);
    setReason("");
    setIsModalOpen(true);
  };

  const handleActionSubmit = async () => {
    if (!reason.trim()) {
      message.warning("Vui lòng nhập lý do!");
      return;
    }
    setActionLoading(true);
    try {
      if (actionType === "REJECT") {
        await dispatch(rejectEvent({ id: selectedId, reason })).unwrap();
        message.success("Đã từ chối sự kiện");
      } else if (actionType === "DELETE") {
        await dispatch(deleteEventForce({ id: selectedId, reason })).unwrap();
        message.success("Đã xóa vĩnh viễn sự kiện");
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error(error || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(approveEvent(id)).unwrap();
      message.success("Đã duyệt sự kiện");
    } catch (error) {
      message.error(error || "Lỗi khi duyệt");
    }
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (src) => (
        <Image
          width={60}
          height={60}
          src={src}
          style={{ borderRadius: 8, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Thông tin sự kiện",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 4 }}>
            {text}
          </div>
          {/* Hiển thị thêm người tạo nhỏ ở dưới */}
          <Space size={4}>
            <Avatar size="small" src={record.createdBy?.avatar} />
            <span style={{ fontSize: 12, color: "gray" }}>
              {record.createdBy?.displayName}
            </span>
          </Space>
        </div>
      ),
    },

    {
      title: "Địa điểm",
      key: "location",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.city}</div>
          <div style={{ fontSize: 12, color: "gray" }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "startTime",
      key: "startTime",
      render: (time) => (
        <div>
          <div>{new Date(time).toLocaleDateString("vi-VN")}</div>
          <div style={{ fontSize: 11, color: "#888" }}>
            {new Date(time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "APPROVED") color = "success";
        if (status === "PENDING_APPROVAL") color = "warning";
        if (status === "CANCELLED") color = "error";
        if (status === "COMPLETED") color = "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          {record.status === "PENDING_APPROVAL" && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record._id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  shape="circle"
                  icon={<CloseCircleOutlined />}
                  onClick={() => openActionModal("REJECT", record._id)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Xóa vĩnh viễn">
            <Button
              danger
              type="dashed"
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => openActionModal("DELETE", record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: "PENDING_APPROVAL", label: "Chờ duyệt" },
    { key: "APPROVED", label: "Đang diễn ra" },
    { key: "COMPLETED", label: "Đã hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>Quản lý Sự kiện</h2>

      {/* === [MỚI] THANH BỘ LỌC (FILTER BAR) === */}
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
              placeholder="Tìm tên sự kiện, địa chỉ..."
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
            />
          </Col>
          <Col xs={24} sm={24} md={10} style={{ textAlign: "right" }}>
            {/* Chỗ này có thể để nút Reset hoặc Export nếu cần */}
          </Col>
        </Row>
      </div>

      <Tabs
        defaultActiveKey="PENDING_APPROVAL"
        items={tabItems}
        onChange={(key) => setActiveTab(key)}
        type="card"
      />

      <Table
        columns={columns}
        dataSource={eventList}
        rowKey="_id"
        loading={loading}
        pagination={{
          total: pagination.total,
          current: pagination.page,
          pageSize: pagination.limit,
        }}
        onChange={handleTableChange}
      />

      {/* === MODAL (Giữ nguyên) === */}
      <Modal
        title={
          actionType === "REJECT" ? "Từ chối sự kiện" : "Xóa vĩnh viễn sự kiện"
        }
        open={isModalOpen}
        onOk={handleActionSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={actionType === "REJECT" ? "Từ chối" : "Xóa ngay"}
        okButtonProps={{ danger: true, loading: actionLoading }}
        cancelText="Hủy"
      >
        <p style={{ marginBottom: 8 }}>
          {actionType === "REJECT"
            ? "Vui lòng nhập lý do từ chối (sẽ gửi thông báo cho người dùng):"
            : "Hành động này không thể hoàn tác. Nhập lý do xóa:"}
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Ví dụ: Nội dung không phù hợp, Spam..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default Events;
