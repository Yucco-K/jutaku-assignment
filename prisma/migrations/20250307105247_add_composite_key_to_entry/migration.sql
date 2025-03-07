/*
  Warnings:

  - The primary key for the `Entry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Entry_pkey" PRIMARY KEY ("project_id", "user_id");
