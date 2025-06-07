"use client";
import { useState, useEffect } from "react";
import {
  Button,
  List,
  Modal,
  Form,
  Input,
  Checkbox,
  Space,
  Tag,
  Typography,
  Switch,
  message
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { createMonitor, getMonitors, deleteMonitor } from "@/lib/actions";
import "antd/dist/reset.css";

const { Text } = Typography;

const dummyData = [
  {
    id: "1",
    address: "0x73484943C...8becD77B9",
    nameTag: "My Primary Address",
    note: "My primary address",
    addedOn: "2022-07-05",
    balance: "$521.99",
    notify: "all",
    tokens: ["erc20"]
  },
  {
    id: "2",
    address: "0xc2009D70...780eaF2d7",
    nameTag: null,
    note: "Secondary Address",
    addedOn: "2024-03-12",
    balance: "$45.73",
    notify: "incoming",
    tokens: []
  }
];

export default function Home() {
  const [monitors, setMonitors] = useState(dummyData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

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
    try {
      const createMonitorRes = await createMonitor(values);
      console.log("createMonitorRes:", createMonitorRes);
      if (createMonitorRes?.error) {
        console.error("Error creating monitor:", createMonitorRes.error);
        message.error(`Failed to create monitor: ${createMonitorRes.error}`);
        return;
      }
      message.success("Monitor created successfully");
      return createMonitorRes;
    } catch (error) {
      console.error("Error creating monitor:", error);
      message.error("Failed to create monitor. Please try again.");
    }
  };

  const handleGetMonitors = async () => {
    try {
      const getMonitorsRes = await getMonitors({
        email: "salmandev@gmail.com"
      });
      console.log("getMonitorsRes:", getMonitorsRes);
      if (getMonitorsRes?.error) {
        console.error("Error getting monitors:", getMonitorsRes.error);
      }
      console.log("Fetched monitors:", getMonitorsRes);
      setMonitors(getMonitorsRes || []);
    } catch (error) {
      console.error("Error fetching monitors:", error);
      message.error("Failed to fetch monitors. Please try again.");
    }
  };

  const handleDeleteMonitor = async (id) => {
    try {
      const deleteMonitorRes = await deleteMonitor(id);
      console.log("deleteMonitorRes:", deleteMonitorRes);
      if (deleteMonitorRes.error) {
        message.error(`Failed to delete monitor: ${deleteMonitorRes.error}`);
        console.error("Error deleting monitor:", deleteMonitorRes.error);
      }
      message.success("Monitor deleted successfully");
      return deleteMonitorRes;
    } catch (error) {
      message.error("Failed to delete monitor. Please try again.");
      console.error("Error deleting monitor:", error);
    }
  };

  useEffect(() => {
    handleGetMonitors();
  }, []);

  return (
    <div>
      <List
        bordered
        dataSource={monitors}
        header={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <h2>Monitors</h2>
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Add
            </Button>
          </Space>
        }
        renderItem={(item) => (
          <List.Item
            actions={[
              <Space key="actions">
                <Button
                  title="Edit Monitor"
                  shape="circle"
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(item)}
                />
                <Button
                  title="Delete Monitor"
                  danger
                  shape="circle"
                  type="primary"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteMonitor(item?.id)}
                />
              </Space>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span className="font-mono">{item.address}</span>
                  <MailOutlined />
                </Space>
              }
              description={
                <>
                  <Text type="secondary">Added on: {item.addedOn}</Text>
                  <br />
                  <Text strong>Balance:</Text> {item.balance}
                  <br />
                  {item.note && (
                    <>
                      <Text strong>Note:</Text> {item.note}
                      <br />
                    </>
                  )}
                  {item.nameTag && <Tag color="blue">{item.nameTag}</Tag>}
                </>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        open={modalOpen}
        title={editing ? "Edit Monitor" : "Add New Monitor"}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="address"
            label="Ethereum Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Short description..."
              maxLength={300}
            />
          </Form.Item>
          <Form.Item name="tokens" label="Notify On">
            <Checkbox.Group
              options={[
                { label: "ERC20 Transfers", value: "erc20" },
                { label: "ERC721 Transfers", value: "erc721" },
                { label: "ERC1155 Transfers", value: "erc1155" },
                { label: "Incoming Txns", value: "incoming" },
                { label: "Outgoing Txns", value: "outgoing" }
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
