-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_creator_id_fkey";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
