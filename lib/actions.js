"use server";
import fetch from "node-fetch"; // Ensure you have node-fetch installed
import prisma from "@/lib/prisma";

export async function createMonitor({ email, addresses }) {
  // Lowercase and deduplicate addresses
  const lowercasedAddresses = Array.from(
    new Set(addresses.map((address) => address.toLowerCase()))
  );

  // 1. Find or create webhook
  let webhook = await prisma.noditWebhook.findFirst({
    where: {
      protocol: "ethereum",
      network: "sepolia",
      eventType: "ADDRESS_ACTIVITY"
    }
  });

  let webhookId = webhook?.id;

  if (!webhook) {
    // No webhook exists, create new webhook
    const createWebhookRes = await fetch(
      "https://web3.nodit.io/v1/ethereum/sepolia/webhooks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NODIT_API_KEY
        },
        body: JSON.stringify({
          eventType: "ADDRESS_ACTIVITY",
          description: "Monitor for address activity",
          notification: { webhookUrl: "https://your-webhook-url.com" },
          condition: { addresses: lowercasedAddresses }
        })
      }
    );
    if (!createWebhookRes.ok) {
      const err = await createWebhookRes.text();
      throw new Error("Failed to create webhook: " + err);
    }
    const webhookJson = await createWebhookRes.json();
    webhookId = webhookJson.subscriptionId;
    webhook = await prisma.noditWebhook.create({
      data: {
        id: webhookId,
        webhookUrl: "https://your-webhook-url.com",
        addresses: lowercasedAddresses
      }
    });
  }

  // Upsert monitor (create or update for this email)
  await prisma.monitor.upsert({
    where: { email },
    update: { addresses: lowercasedAddresses, webhookId },
    create: { email, addresses: lowercasedAddresses, webhookId }
  });

  // After upsert, recalculate all addresses for this webhook
  const allMonitors = await prisma.monitor.findMany({ where: { webhookId } });
  const allAddresses = Array.from(
    new Set(allMonitors.flatMap((m) => m.addresses))
  );

  // Update webhook via Nodit API and DB
  const updateWebhookRes = await fetch(
    `https://web3.nodit.io/v1/ethereum/sepolia/webhooks/${webhookId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.NODIT_API_KEY
      },
      body: JSON.stringify({
        condition: { addresses: allAddresses }
      })
    }
  );
  if (!updateWebhookRes.ok) {
    const err = await updateWebhookRes.text();
    throw new Error("Failed to update webhook: " + err);
  }
  await prisma.noditWebhook.update({
    where: { id: webhookId },
    data: { addresses: allAddresses }
  });

  return { message: "Monitor created/updated successfully" };
}

export async function deleteMonitor({ id }) {
  // TODO: update nodit webhook via api, remove addresses of given user
  // get monitor by id
  const monitor = await prisma.monitor.findUnique({
    where: { id }
  });
  if (monitor) {
    // get webhook by id
    const webhook = await prisma.noditWebhook.findUnique({
      where: { id: monitor.webhookId }
    });
    if (!webhook) {
      console.error("Webhook not found for monitor:", monitor);
      throw new Error("Webhook not found");
    }

    const addressesToRemove = monitor.addresses;
    const updatedAddresses = webhook.addresses.filter(
      (address) => !addressesToRemove.includes(address)
    );
    // Update webhook via Nodit API to remove addresses
    const updateWebhookRes = await fetch(
      `https://web3.nodit.io/v1/ethereum/sepolia/webhooks/${monitor.webhookId}`,
      {
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
      }
    );
    const updateWebhookJson = await updateWebhookRes.json();
    if (!updateWebhookRes.ok) {
      console.error("Failed to update webhook:", updateWebhookJson);
      throw new Error("Failed to update webhook");
    }
  }

  // delete monitor from database
  console.log("Deleting monitor...");
  await prisma.monitor.delete({
    where: { id }
  });
  console.log("Monitor deleted");
  return { message: "Monitor deleted successfully" };
}

export async function getMonitors({ email }) {
  // get monitors for the given email
  const monitors = await prisma.monitor.findMany({
    where: { email }
  });
  console.log("Retrieved all monitors");
  return monitors;
}
