/*
  Warnings:

  - A unique constraint covering the columns `[mobilephone1]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "organizations_mobilephone1_key" ON "organizations"("mobilephone1");
