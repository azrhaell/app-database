/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `federalrevenue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "federalrevenue_cnpj_key" ON "federalrevenue"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cnpj_key" ON "organizations"("cnpj");
