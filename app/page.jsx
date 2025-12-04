"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Tag,
  Typography,
  Switch,
  message,
  Popconfirm,
  Empty,
  Select
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PlusOutlined,
  SyncOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppKitAccount } from "@reown/appkit/react";
import { ethers } from "ethers";
import { createMonitor, getMonitors, deleteMonitor } from "@/lib/actions";
import "antd/dist/reset.css";

const { Text } = Typography;

export default function Home() {
  const [monitors, setMonitors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState({
    data: false,
    create: false
  });

  const [form] = Form.useForm();
  const { address: account = "" } = useAppKitAccount(); // empty string is neccessary to avoid undefined issues in prisma queries

  const showAddModal = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const showEditModal = (item) => {
    setEditing(item);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const handleFinish = async (values) => {
    if (!account) return message.error("Please connect your wallet first");
    setLoading((prev) => ({ ...prev, create: true }));
    try {
      const createMonitorRes = await createMonitor(values, account);
      console.log("createMonitorRes:", createMonitorRes);
      if (createMonitorRes?.error) {
        console.error("Error creating monitor:", createMonitorRes.error);
        message.error(`Failed to create monitor: ${createMonitorRes.error}`);
        return;
      }
      message.success("Monitor created/updated successfully");
      setModalOpen(false);
      form.resetFields();
      handleGetMonitors(); // Refresh the list after creation
      return createMonitorRes;
    } catch (error) {
      console.error("Error creating monitor:", error);
      message.error("Failed to create monitor. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleGetMonitors = async () => {
    setLoading((prev) => ({ ...prev, data: true }));
    try {
      const getMonitorsRes = await getMonitors(account);
      console.log("getMonitorsRes:", getMonitorsRes);
      if (getMonitorsRes?.error) {
        console.error("Error getting monitors:", getMonitorsRes.error);
        message.error(`Failed to fetch monitors: ${getMonitorsRes.error}`);
        return;
      }
      console.log("Fetched monitors:", getMonitorsRes);
      setMonitors(getMonitorsRes || []);
    } catch (error) {
      console.error("Error fetching monitors:", error);
      message.error("Failed to fetch monitors. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const handleDeleteMonitor = async (id) => {
    if (!account) return message.error("Please connect your wallet first");
    try {
      const deleteMonitorRes = await deleteMonitor(id, account);
      console.log("deleteMonitorRes:", deleteMonitorRes);
      if (deleteMonitorRes.error) {
        console.error("Error deleting monitor:", deleteMonitorRes.error);
        message.error(`Failed to delete monitor: ${deleteMonitorRes.error}`);
        return;
      }
      message.success("Monitor deleted successfully");
      handleGetMonitors();
      return deleteMonitorRes;
    } catch (error) {
      message.error("Failed to delete monitor. Please try again.");
      console.error("Error deleting monitor:", error);
    }
  };

  useEffect(() => {
    handleGetMonitors();
  }, [account]);

  const columns = [
    {
      title: "Address",
      key: "address",
      render: ({ address, description }) => (
        <Space orientation="vertical">
          <Text strong>{address}</Text>
          <Text type="secondary">{description}</Text>
        </Space>
      )
    },
    {
      title: "Network",
      dataIndex: "protocol",
      key: "protocol",
      render: (protocol, record) => (
        <Tag color="purple">
          {protocol?.toUpperCase()} {record?.network?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <Text type="secondary">{email || "Not provided"}</Text>
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <Text type="secondary">
          {dayjs(createdAt).format("MMM D, YYYY h:mm A")}
        </Text>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, item) => (
        <Space>
          <Button
            title="Edit Monitor"
            shape="circle"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(item)}
          />
          <Popconfirm
            title="Are you sure you want to delete this monitor?"
            onConfirm={() => handleDeleteMonitor(item?.id)}
          >
            <Button
              title="Delete Monitor"
              danger
              shape="circle"
              type="primary"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space orientation="vertical" style={{ width: "100%", marginBottom: 16 }}>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2 style={{ margin: 0, flex: 1, textAlign: "left" }}>Monitors</h2>
          <Space style={{ gap: 8 }}>
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Add
            </Button>
            <Button
              type="default"
              shape="circle"
              title="Refresh"
              icon={<SyncOutlined spin={loading?.data || false} />}
              onClick={handleGetMonitors}
            />
          </Space>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={monitors}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 24 }}
              description={
                account
                  ? "No monitors found. Click '+ Add' to create a new monitor."
                  : "Please connect your wallet to view or create monitors."
              }
            />
          )
        }}
        loading={loading?.data || false}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Edit Monitor" : "Add New Monitor"}
        okButtonProps={{ loading: loading?.create || false }}
        cancelButtonProps={{ disabled: loading?.create || false }}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{
            chain: "ethereum-sepolia"
          }}
        >
          <Form.Item
            name="chain"
            label="Select network to monitor"
            hasFeedback
            help="Only Sepolia is supported for now. More networks will be added soon."
            rules={[
              { required: true, message: "Please select a chain to monitor" }
            ]}
          >
            <Select
              options={[
                { label: "Ethereum Sepolia", value: "ethereum-sepolia" },
                { label: "Ethereum", value: "ethereum", disabled: true },
                { label: "Arbitrum", value: "arbitrum", disabled: true },
                { label: "Polygon", value: "polygon", disabled: true }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="address"
            label="Wallet Address"
            hasFeedback
            help={
              editing
                ? "Address cannot be changed. Create a new monitor if needed."
                : undefined
            }
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (ethers.isAddress(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Please enter a valid wallet address");
                }
              }
            ]}
          >
            <Input placeholder="0x..." readOnly={editing} />
          </Form.Item>

          {/* email */}
          <Form.Item
            name="email"
            label="Email"
            hasFeedback
            help={
              editing
                ? "Email cannot be changed/reused. Create a new monitor if needed with a different email."
                : undefined
            }
            rules={[
              {
                required: true,
                message: "Please enter your email to receive notifications"
              },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input placeholder="you@example.com" readOnly={editing} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Short description..."
              rows={2}
              maxLength={40}
              showCount
            />
          </Form.Item>
          <Form.Item name="tokens" label="Notify On">
            <Checkbox.Group
              options={[
                { label: "Incoming Txns", value: "incoming" },
                { label: "Outgoing Txns", value: "outgoing" },
                { label: "ERC20 Transfers", value: "erc20" },
                { label: "ERC721 Transfers", value: "erc721" },
                { label: "ERC1155 Transfers", value: "erc1155" }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Enable Monitor"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
