/*
  Warnings:

  - Added the required column `webhookId` to the `monitors` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_protocol_network_event";

-- AlterTable
ALTER TABLE "monitors" ADD COLUMN     "webhookId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_protocol_network_event" ON "nodit_webhooks"("id", "protocol", "network", "eventType");
