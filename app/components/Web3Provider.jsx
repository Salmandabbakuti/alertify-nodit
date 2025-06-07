"use client";
import { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { arbitrum, mainnet } from "@reown/appkit/networks";

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

// 2. Set the networks
const networks = [arbitrum, mainnet];

// 3. Create a metadata object - optional
const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"]
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ConfigProvider
      theme={{
        algorithm: [theme.defaultAlgorithm]
      }}
    >
      {mounted && children}
    </ConfigProvider>
  );
}
