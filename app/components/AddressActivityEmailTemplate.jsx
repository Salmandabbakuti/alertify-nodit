import React from "react";
import {
  Html,
  Text,
  Link,
  Container,
  Section,
  Heading
} from "@react-email/components";
import dayjs from "dayjs";
import { ethers } from "ethers";

function formatTokenValue(value, decimals = 18) {
  try {
    return ethers.formatUnits(value, decimals);
  } catch {
    return value;
  }
}

function formatTimestamp(unix) {
  if (!unix) return "Unknown time";
  return dayjs.unix(unix).format("MMM D, YYYY h:mm A");
}

export default function AddressActivityEmailTemplate({ tx }) {
  const explorerBaseUrl = `https://sepolia.etherscan.io`;
  const isToken = tx.type !== "native";

  return (
    <Html lang="en">
      <Container
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          maxWidth: "600px",
          backgroundColor: "#fff"
        }}
      >
        <Section>
          <Heading as="h2">
            {tx.direction === "incoming" ? "📥 Incoming" : "📤 Outgoing"}{" "}
            {tx.type === "native" ? "Transaction" : tx.type.toUpperCase()} Alert
          </Heading>
          <Text style={{ color: "#555" }}>
            <strong>🔗 Chain:</strong> Ethereum Sepolia
          </Text>
          <Text>
            <strong>🕒 Time:</strong> {formatTimestamp(tx.timestamp)}
          </Text>
          <Text>
            <strong>🔢 Block:</strong>{" "}
            <Link href={`${explorerBaseUrl}/block/${tx.block}`}>
              {tx.block}
            </Link>
          </Text>
          <Text>
            <strong>👤 From:</strong>{" "}
            <Link href={`${explorerBaseUrl}/address/${tx.from}`}>
              {tx.from}
            </Link>
          </Text>
          <Text>
            <strong>👤 To:</strong>{" "}
            <Link href={`${explorerBaseUrl}/address/${tx.to}`}>{tx.to}</Link>
          </Text>

          {isToken && (
            <>
              <Text>
                <strong>🪙 Token Address:</strong>{" "}
                <Link href={`${explorerBaseUrl}/token/${tx.tokenAddress}`}>
                  {tx.tokenAddress}
                </Link>
              </Text>
              {tx.tokenId && (
                <Text>
                  <strong>🆔 Token ID:</strong> {tx.tokenId}
                </Text>
              )}
              {tx.value && (
                <Text>
                  <strong>💰 Amount:</strong> {formatTokenValue(tx.value)}
                </Text>
              )}
            </>
          )}

          {!isToken && tx.value && (
            <Text>
              <strong>💰 Value:</strong> {formatTokenValue(tx.value)} ETH
            </Text>
          )}

          <Text>
            <strong>🧾 Transaction:</strong>{" "}
            <Link href={`${explorerBaseUrl}/tx/${tx.txHash}`}>{tx.txHash}</Link>
          </Text>
        </Section>

        <Section
          style={{
            marginTop: "30px",
            borderTop: "1px solid #eee",
            paddingTop: "10px",
            color: "#888",
            fontSize: "12px"
          }}
        >
          <Text style={{ textAlign: "center" }}>
            🚨 Powered by{" "}
            <Link href="https://alertify-nodit.vercel.app">
              <strong style={{ color: "#f5a623" }}>Alertify</strong>
            </Link>
          </Text>
        </Section>
      </Container>
    </Html>
  );
}
