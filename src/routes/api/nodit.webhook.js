import { createFileRoute } from "@tanstack/react-router";
import crypto from "crypto";
import { Resend } from "resend";
import { json } from "@tanstack/react-start";
import prisma from "../../lib/prisma";
import { parseNoditWebhookMessage } from "../../lib/utils";
import AddressActivityEmailTemplate from "../../components/AddressActivityEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

const isValidSignature = (body, signature, signingKey) => {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(JSON.stringify(body), "utf8");
  const digest = hmac.digest("hex");
  return digest === signature;
};

export const Route = createFileRoute("/api/nodit/webhook")({
  server: {
    handlers: {
      GET: () => new Response("Hello from Nodit Webhook Handler!"),
      POST: async ({ request }) => {
        const body = await request.json();
        const signature = req.headers.get("x-signature");
        const signingKey = process.env.NODIT_WEBHOOK_SIGNING_KEY;

        if (!isValidSignature(body, signature, signingKey)) {
          console.error("Invalid webhook signature");
          return new Response("Invalid webhook signature", { status: 401 });
        }
        try {
          // parse webhook message
          console.log("Received webhook event:", JSON.stringify(body, null, 2));
          const webhookMessageObj = body?.event?.messages?.[0] || {};
          const from = webhookMessageObj?.from_address?.toLowerCase();
          const to = webhookMessageObj?.to_address?.toLowerCase();
          // get all active monitors with any of the addresses in the webhook message
          const monitors = await prisma.monitor.findMany({
            skip: 0,
            take: 20, // Limit to 20 monitors for performance
            orderBy: { createdAt: "asc" }, // first created first
            where: {
              address: {
                in: [from, to]
              },
              isActive: true
            }
          });
          // If no monitors found, log and return early
          if (monitors.length === 0) {
            console.log("No active monitors found for this event.");
            return json({ received: true }, { status: 204 });
          }
          const parsedTx = parseNoditWebhookMessage(webhookMessageObj);
          const emailResults = await Promise.all(
            monitors.map(async (monitor) => {
              const txDirection =
                to === monitor.address.toLowerCase() ? "incoming" : "outgoing";
              const emailObj = {
                from: "Alertify <onboarding@resend.dev>",
                to: monitor.email,
                subject: `New Activity Alert for ${monitor.address} (${monitor?.description || "No Description"})`
                // react: (
                //   <AddressActivityEmailTemplate
                //     tx={{
                //       ...parsedTx,
                //       direction: txDirection,
                //       monitorDescription: monitor?.description
                //     }}
                //   />
                // )
              };
              try {
                const { data, error } = await resend.emails.send(emailObj);
                if (!data?.id || error) {
                  return {
                    email: monitor.email,
                    status: "failed",
                    error: error || "No data.id returned"
                  };
                }
                return { email: monitor.email, status: "success" };
              } catch (err) {
                return {
                  email: monitor.email,
                  status: "failed",
                  error: err?.message || err
                };
              }
            })
          );
          console.log("Webhook Email results:", emailResults);
          return json({ received: true }, { status: 200 });
        } catch (error) {
          console.error("Error processing webhook:", error);
          return json(
            { error: "Error processing webhook", message: error.message },
            { status: 500 }
          );
        }
      }
    }
  }
});
