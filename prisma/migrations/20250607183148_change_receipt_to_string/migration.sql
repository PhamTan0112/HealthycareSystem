/*
  Warnings:

  - The `receipt_number` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Payment_receipt_number_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "receipt_number",
ADD COLUMN     "receipt_number" SERIAL NOT NULL;
