"use server";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import { errorResponse } from "@/lib/utils";

const NODIT_WEBHOOK_ID = process.env.NODIT_WEBHOOK_ID || "6157";
const BASE_URL = "https://web3.nodit.io/v1/ethereum/sepolia/webhooks";

export async function createMonitor(
  { email, address, description, isActive = true },
  createdBy
) {
  // Lowercase and deduplicate addresses
  const lowercasedAddress = address?.toLowerCase();
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
      new Set([lowercasedAddress, ...addressesFromWebhook])
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
      where: {
        email,
        address: lowercasedAddress,
        createdBy: createdBy?.toLowerCase()
      },
      update: {
        description,
        isActive
      },
      create: {
        email,
        address: lowercasedAddress,
        webhookId: NODIT_WEBHOOK_ID,
        description,
        isActive,
        createdBy: createdBy?.toLowerCase()
      }
    });

    return { message: "Monitor created/updated successfully" };
  } catch (error) {
    console.error("Error creating/updating monitor:", error);
    return errorResponse(error);
  }
}

export async function deleteMonitor(id, createdBy) {
  if (!id) return errorResponse("Monitor ID is required", 400, true);
  try {
    const monitor = await prisma.monitor.findUnique({
      where: { id, createdBy: createdBy?.toLowerCase() }
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

      const addressToRemove = monitor.address;
      const updatedAddresses = addressesFromWebhook.filter(
        (address) => address !== addressToRemove
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
      where: { id, createdBy: createdBy?.toLowerCase() }
    });
    console.log("Monitor deleted");
    return { message: "Monitor deleted successfully" };
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return errorResponse(error);
  }
}

export async function getMonitors(createdBy) {
  // get monitors for the given createdBy
  const monitors = await prisma.monitor.findMany({
    orderBy: { createdAt: "desc" },
    where: { createdBy: createdBy?.toLowerCase() }
  });
  console.log("Retrieved all monitors");
  return monitors;
}
