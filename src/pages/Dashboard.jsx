import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, message, Spin } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { adminApi } from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (error) {
        message.error("Lỗi tải số liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan Hệ thống</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng Tình nguyện viên"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined style={{ color: "#3f8600" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng Sự kiện"
              value={stats?.totalEvents || 0}
              prefix={<CalendarOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate("/events")}
            style={{ cursor: "pointer", border: "1px solid #faad14" }}
          >
            <Statistic
              title="Sự kiện Chờ duyệt"
              value={stats?.pendingEvents || 0}
              styles={{ content: { color: "#faad14" } }}
              prefix={<ClockCircleOutlined />}
              suffix="cần xử lý"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate("/tickets")}
            style={{ cursor: "pointer", border: "1px solid #cf1322" }}
          >
            <Statistic
              title="Báo cáo Vi phạm"
              value={stats?.pendingTickets || 0}
              styles={{ content: { color: "#cf1322" } }}
              prefix={<WarningOutlined />}
              suffix="cần xử lý"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Hướng dẫn nhanh" style={{ marginTop: 24 }}>
        <p>👋 Chào mừng bạn đến với trang quản trị EcoConnect.</p>
        <ul>
          <li>
            Nhấn vào ô <b>"Sự kiện Chờ duyệt"</b> để xem và duyệt các bài đăng
            mới.
          </li>
          <li>
            Nhấn vào ô <b>"Báo cáo Vi phạm"</b> để xử lý các khiếu nại từ người
            dùng.
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;
