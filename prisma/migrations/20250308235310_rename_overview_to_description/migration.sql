/*
  Warnings:

  - You are about to drop the column `overview` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "overview",
ADD COLUMN     "description" TEXT;
