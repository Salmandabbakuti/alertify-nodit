import crypto from "crypto";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import AddressActivityEmailTemplate from "@/app/components/AddressActivityEmailTemplate";
import prisma from "@/lib/prisma";
import { parseNoditMessage } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

const isValidSignature = (body, signature, signingKey) => {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(JSON.stringify(body), "utf8");
  const digest = hmac.digest("hex");
  return digest === signature;
};

export async function POST(req) {
  const body = await req.json();
  const signature = req.headers.get("x-signature");
  const signingKey = process.env.NODIT_WEBHOOK_SIGNING_KEY;

  if (!isValidSignature(body, signature, signingKey)) {
    console.error("Invalid webhook signature");
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 401 }
    );
  }
  try {
    // parse webhook message
    const webhookMessageObj = body?.event?.messages?.[0] || {};
    const from = webhookMessageObj?.from_address?.toLowerCase();
    const to = webhookMessageObj?.to_address?.toLowerCase();
    const parsedTx = parseNoditMessage(webhookMessageObj);
    // get all monitors with to and from addresses
    const monitors = await prisma.monitor.findMany({
      where: {
        address: {
          in: [from, to]
        },
        isActive: true
      }
    });

    const emailResults = await Promise.all(
      monitors.map(async (monitor) => {
        const txDirection =
          to === monitor.address.toLowerCase() ? "incoming" : "outgoing";
        const emailObj = {
          from: "Alertify <onboarding@resend.dev>",
          to: monitor.email,
          subject: `New Activity Alert for ${monitor.address}`,
          react: (
            <AddressActivityEmailTemplate
              tx={{ ...parsedTx, direction: txDirection }}
            />
          )
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

    console.log("webhook received:", JSON.stringify(body, null, 2));
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Error processing webhook", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return NextResponse.json({ message: "Hello from Nodit Webhook Handler" });
}
