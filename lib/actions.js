"use server";
import fetch from "node-fetch"; // Ensure you have node-fetch installed
import prisma from "@/lib/prisma";
import { errorResponse } from "./utils";

const NODIT_WEBHOOK_ID = process.env.NODIT_WEBHOOK_ID || "6157";
const BASE_URL = "https://web3.nodit.io/v1/ethereum/sepolia/webhooks";

export async function createMonitor({ email, addresses }) {
  // Lowercase and deduplicate addresses
  const lowercasedAddresses = Array.from(
    new Set(addresses.map((address) => address.toLowerCase()))
  );
  try {
    // get webhook from nodit API
    const getWebhookRes = await fetch(
      `${BASE_URL}?subscriptionId=${NODIT_WEBHOOK_ID}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NODIT_API_KEY
        }
      }
    );
    if (!getWebhookRes.ok) {
      const err = await getWebhookRes.text();
      return errorResponse(err, 500, true);
    }
    const webhookData = await getWebhookRes.json();
    console.log("Webhook data:", webhookData?.items[0]);
    const addressesFromWebhook =
      webhookData?.items[0]?.condition?.addresses || [];

    // Combine addresses from monitor and webhook, deduplicate
    const updatedAddresses = Array.from(
      new Set([...lowercasedAddresses, ...addressesFromWebhook])
    );
    console.log("Updated addresses for webhook:", updatedAddresses);

    // Update webhook via Nodit API and DB
    const updateWebhookRes = await fetch(`${BASE_URL}/${NODIT_WEBHOOK_ID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NODIT_API_KEY
      },
      body: JSON.stringify({
        condition: { addresses: updatedAddresses }
      })
    });
    if (!updateWebhookRes.ok) {
      const err = await updateWebhookRes.text();
      return errorResponse(err, 500, true);
    }

    // Upsert monitor (create or update for this email)
    await prisma.monitor.upsert({
      where: { email },
      update: { addresses: lowercasedAddresses, webhookId: NODIT_WEBHOOK_ID },
      create: {
        email,
        addresses: lowercasedAddresses,
        webhookId: NODIT_WEBHOOK_ID
      }
    });

    return { message: "Monitor created/updated successfully" };
  } catch (error) {
    console.error("Error creating/updating monitor:", error);
    return errorResponse(error);
  }
}

export async function deleteMonitor({ id }) {
  // TODO: update nodit webhook via api, remove addresses of given user
  // get monitor by id
  try {
    const monitor = await prisma.monitor.findUnique({
      where: { id }
    });
    if (monitor) {
      // get webhook by id
      const webhookRes = await fetch(
        `${BASE_URL}?subscriptionId=${monitor.webhookId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.NODIT_API_KEY
          }
        }
      );
      if (!webhookRes.ok) {
        const err = await webhookRes.text();
        return errorResponse(err, 500, true);
      }
      const webhook = await webhookRes.json();
      const addressesFromWebhook =
        webhook?.items[0]?.condition?.addresses || [];

      const addressesToRemove = monitor.addresses;
      const updatedAddresses = addressesFromWebhook.filter(
        (address) => !addressesToRemove.includes(address)
      );
      // Update webhook via Nodit API to remove addresses
      const updateWebhookRes = await fetch(`${BASE_URL}/${monitor.webhookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NODIT_API_KEY
        },
        body: JSON.stringify({
          condition: {
            addresses: updatedAddresses // If no addresses left, we might want to delete the webhook instead
          }
        })
      });
      if (!updateWebhookRes.ok) {
        const err = await updateWebhookRes.text();
        console.error("Failed to update webhook:", err);
        return errorResponse("Failed to update webhook", 500, true);
      }
    }

    // delete monitor from database
    console.log("Deleting monitor...");
    await prisma.monitor.delete({
      where: { id }
    });
    console.log("Monitor deleted");
    return { message: "Monitor deleted successfully" };
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return errorResponse(error);
  }
}

export async function getMonitors({ email }) {
  // get monitors for the given email
  const monitors = await prisma.monitor.findMany({
    where: { email }
  });
  console.log("Retrieved all monitors");
  return monitors;
}
