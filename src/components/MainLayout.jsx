import React, { useState } from "react";
import { Layout, Menu, Button, theme, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CalendarOutlined,
  WarningOutlined,
  UserOutlined,
  LogoutOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userMenu = {
    items: [
      {
        key: "1",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/events",
      icon: <CalendarOutlined />,
      label: "Quản lý Sự kiện",
      onClick: () => navigate("/events"),
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Người dùng",
      onClick: () => navigate("/users"),
    },
    {
      key: "/tickets",
      icon: <WarningOutlined />,
      label: "Báo cáo vi phạm",
      onClick: () => navigate("/tickets"),
    },
    {
      key: "/broadcast",
      icon: <NotificationOutlined />,
      label: "Thông báo",
      onClick: () => navigate("/broadcast"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          className="demo-logo-vertical"
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: collapsed ? 12 : 18,
          }}
        >
          {collapsed ? "EC" : "EcoConnect"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 24,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />

          {/* Thông tin Admin góc phải */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 500 }}>
              Xin chào, {user?.displayName || "Admin"}
            </span>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar
                style={{ backgroundColor: "#87d068", cursor: "pointer" }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: "auto",
          }}
        >
          {/* Outlet là nơi render các trang con (Dashboard, Events...) */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
