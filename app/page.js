"use client";
import { createMonitor, getMonitors, deleteMonitor } from "@/lib/actions";
import styles from "./page.module.css";

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
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to Next.js</h1>
      <button onClick={handleCreateMonitor}>Create Monitor</button>
      <button onClick={handleGetMonitors}>Get Monitors</button>
      <button onClick={handleDeleteMonitor}>Delete Monitor</button>
    </main>
  );
}
