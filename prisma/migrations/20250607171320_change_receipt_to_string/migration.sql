/*
  Warnings:

  - A unique constraint covering the columns `[receipt_number]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "receipt_number" DROP NOT NULL,
ALTER COLUMN "receipt_number" DROP DEFAULT,
ALTER COLUMN "receipt_number" SET DATA TYPE TEXT;
DROP SEQUENCE "Payment_receipt_number_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receipt_number_key" ON "Payment"("receipt_number");
