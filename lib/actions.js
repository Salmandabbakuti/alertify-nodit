"use server";
import fetch from "node-fetch"; // Ensure you have node-fetch installed
import prisma from "@/lib/prisma";

export async function createMonitor({ email, addresses }) {
  // Lowercase and deduplicate addresses
  const lowercasedAddresses = Array.from(
    new Set(addresses.map((address) => address.toLowerCase()))
  );

  // 1. Find existing webhook
  const webhookExists = await prisma.noditWebhook.findFirst({
    where: {
      protocol: "ethereum",
      network: "sepolia",
      eventType: "ADDRESS_ACTIVITY"
    }
  });

  let webhookId = webhookExists?.id;
  let updatedAddresses = lowercasedAddresses;

  if (!webhookExists) {
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
    const webhookJson = await createWebhookRes.json();
    webhookId = webhookJson.subscriptionId;
    await prisma.noditWebhook.create({
      data: {
        id: webhookJson.subscriptionId,
        webhookUrl: "https://your-webhook-url.com",
        addresses: lowercasedAddresses
      }
    });
  } else {
    // 2. Check if monitor already exists for this email
    const existingMonitor = await prisma.monitor.findUnique({
      where: { email }
    });

    updatedAddresses = new Set([
      ...webhookExists.addresses,
      ...lowercasedAddresses
    ]);

    // If monitor exists, merge or replace addresses based on user intent
    if (existingMonitor) {
      // if monitor exists, remove monitor addresses from webhook addresses and append new addresses
      updatedAddresses = Array.from(updatedAddresses).filter(
        (address) => !existingMonitor.addresses.includes(address)
      );
    }
    // Update webhook via Nodit API
    await fetch(
      `https://web3.nodit.io/v1/ethereum/sepolia/webhooks/${webhookExists.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.NODIT_API_KEY
        },
        body: JSON.stringify({
          condition: { addresses: updatedAddresses }
        })
      }
    );
    // Update webhook in DB
    await prisma.noditWebhook.update({
      where: { id: webhookExists.id },
      data: { addresses: updatedAddresses }
    });
  }

  // Upsert monitor (create or update for this email)
  await prisma.monitor.upsert({
    where: { email },
    update: { addresses: lowercasedAddresses },
    create: { email, addresses: lowercasedAddresses, webhookId }
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
