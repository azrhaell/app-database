/*
  Warnings:

  - A unique constraint covering the columns `[codeoperador]` on the table `operators` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "operators_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "operators_codeoperador_key" ON "operators"("codeoperador");
