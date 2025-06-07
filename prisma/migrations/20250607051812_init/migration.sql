-- CreateTable
CREATE TABLE "nodit_webhooks" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'ethereum',
    "network" TEXT NOT NULL DEFAULT 'sepolia',
    "eventType" TEXT NOT NULL DEFAULT 'ADDRESS_ACTIVITY',
    "webhookUrl" TEXT NOT NULL,
    "addresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodit_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL DEFAULT 'ethereum',
    "network" TEXT NOT NULL DEFAULT 'sepolia',
    "eventType" TEXT NOT NULL DEFAULT 'ADDRESS_ACTIVITY',
    "email" TEXT NOT NULL,
    "addresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_protocol_network_event" ON "nodit_webhooks"("protocol", "network", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "monitors_email_key" ON "monitors"("email");

-- CreateIndex
CREATE INDEX "idx_email_protocol_network_event" ON "monitors"("email", "protocol", "network", "eventType");
