/*
  Warnings:

  - The primary key for the `ProjectSkill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectSkill` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Entry_id_key";

-- DropIndex
DROP INDEX "Project_id_key";

-- DropIndex
DROP INDEX "ProjectSkill_id_key";

-- DropIndex
DROP INDEX "Skill_id_key";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "ProjectSkill" DROP CONSTRAINT "ProjectSkill_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ProjectSkill_pkey" PRIMARY KEY ("project_id", "skill_id");
