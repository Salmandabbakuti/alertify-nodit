-- CreateTable
CREATE TABLE "monitors" (
    "id" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "protocol" TEXT NOT NULL DEFAULT 'ethereum',
    "network" TEXT NOT NULL DEFAULT 'sepolia',
    "eventType" TEXT NOT NULL DEFAULT 'ADDRESS_ACTIVITY',
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "webhookId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monitors_email_key" ON "monitors"("email");

-- CreateIndex
CREATE INDEX "idx_email_createdBy" ON "monitors"("id", "email", "createdBy");
