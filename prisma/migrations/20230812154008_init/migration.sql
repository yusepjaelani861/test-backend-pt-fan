-- AddForeignKey
ALTER TABLE "Epresence" ADD CONSTRAINT "Epresence_id_users_fkey" FOREIGN KEY ("id_users") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
