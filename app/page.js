"use client";
import { useState } from "react";
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
  Switch
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

const handleCreateMonitor = async () => {
  const createMonitorRes = await createMonitor({
    email: "salmandev@gmail.com",
    addresses: [
      "0x1b139586adb91e6bd81a213d98336a7c440bbe4e",
      "0x9b3be3628e7f4957070990305F5f0ddeb9b0A0a3"
    ]
  });
  console.log("createMonitorRes:", createMonitorRes);
  if (createMonitorRes.error) {
    console.error("Error creating monitor:", createMonitorRes.error);
  }
  return createMonitorRes;
};

const handleGetMonitors = async () => {
  const getMonitorsRes = await getMonitors({ email: "salmandev@gmail.com" });
  console.log("getMonitorsRes:", getMonitorsRes);
  if (getMonitorsRes.error) {
    console.error("Error getting monitors:", getMonitorsRes.error);
  }
  return getMonitorsRes;
};

const handleDeleteMonitor = async () => {
  const deleteMonitorRes = await deleteMonitor({
    id: "cmbm48i7s0000lszqaljj2cxa"
  });
  console.log("deleteMonitorRes:", deleteMonitorRes);
  if (deleteMonitorRes.error) {
    console.error("Error deleting monitor:", deleteMonitorRes.error);
  }
  return deleteMonitorRes;
};

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

  const handleFinish = (values) => {
    const newData = {
      ...values,
      id: editing ? editing.id : Date.now().toString(),
      addedOn: editing?.addedOn || dayjs().format("YYYY-MM-DD"),
      balance: "$0.00",
      address: values.address
    };

    const updated = editing
      ? monitors.map((addr) => (addr.id === editing.id ? newData : addr))
      : [...monitors, newData];

    setMonitors(updated);
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setMonitors(monitors.filter((a) => a.id !== id));
  };

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
                  onClick={() => handleDelete(item.id)}
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
        title={editing ? "Edit Address" : "Add New Address"}
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
