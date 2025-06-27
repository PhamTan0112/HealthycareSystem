/*
  Warnings:

  - The values [NURSE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');
ALTER TABLE "Staff" ALTER COLUMN "role" DROP DEFAULT;
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_staff_fkey";

-- DropTable
DROP TABLE "Staff";
