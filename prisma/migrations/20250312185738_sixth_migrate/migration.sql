/*
  Warnings:

  - A unique constraint covering the columns `[ddd]` on the table `codeddd` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `legalnatures` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `operators` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "codeddd" ALTER COLUMN "ddd" SET DEFAULT '00';

-- CreateIndex
CREATE UNIQUE INDEX "codeddd_ddd_key" ON "codeddd"("ddd");

-- CreateIndex
CREATE UNIQUE INDEX "legalnatures_name_key" ON "legalnatures"("name");

-- CreateIndex
CREATE UNIQUE INDEX "operators_name_key" ON "operators"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");
