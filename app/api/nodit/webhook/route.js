import { NextResponse } from "next/server";
import crypto from "crypto";

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
    return NextResponse.json(
      { message: "Invalid webhook signature" },
      { status: 401 }
    );
  }
  // Here you can handle the incoming webhook data
  console.log("webhook received:", JSON.stringify(body, null, 2));
  return NextResponse.json({ message: "Webhook received", data: body });
}

export async function GET(req) {
  return NextResponse.json({ message: "Hello from Nodit Webhook Handler" });
}
