/*
  Warnings:

  - The values [LAB_TECHNICIAN,CASHIER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'NURSE', 'DOCTOR', 'PATIENT');
ALTER TABLE "Staff" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shift_type" TEXT,
ADD COLUMN     "specialization" TEXT,
ALTER COLUMN "role" SET DEFAULT 'NURSE';
