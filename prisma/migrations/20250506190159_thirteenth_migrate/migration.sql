/*
  Warnings:

  - You are about to drop the column `idrelatedorganizations` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `mobilephone1` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `mobilephone2` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `operatorname` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `ported` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `previousoperator` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `startofcontract` on the `organizations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_idrelatedorganizations_fkey";

-- DropIndex
DROP INDEX "organizations_mobilephone1_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "idrelatedorganizations",
DROP COLUMN "mobilephone1",
DROP COLUMN "mobilephone2",
DROP COLUMN "operatorname",
DROP COLUMN "ported",
DROP COLUMN "previousoperator",
DROP COLUMN "startofcontract";

-- CreateTable
CREATE TABLE "numbers" (
    "idNumber" SERIAL NOT NULL,
    "mobilephone1" VARCHAR(13),
    "mobilephone2" VARCHAR(13),
    "startofcontract" TIMESTAMP(3),
    "ported" BOOLEAN DEFAULT false,
    "previousoperator" VARCHAR(50),
    "operatorname" VARCHAR(50),
    "idCompany" INTEGER NOT NULL,
    "idOperator" INTEGER,
    "idBdo" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "numbers_pkey" PRIMARY KEY ("idNumber")
);

-- CreateTable
CREATE TABLE "bdo" (
    "idRegister" SERIAL NOT NULL,
    "number" VARCHAR(13),
    "codeoperador" VARCHAR(2),
    "date" TIMESTAMP(3),
    "idOperator" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "bdo_pkey" PRIMARY KEY ("idRegister")
);

-- CreateIndex
CREATE UNIQUE INDEX "numbers_mobilephone1_key" ON "numbers"("mobilephone1");

-- CreateIndex
CREATE UNIQUE INDEX "numbers_idBdo_key" ON "numbers"("idBdo");

-- CreateIndex
CREATE UNIQUE INDEX "bdo_number_key" ON "bdo"("number");

-- AddForeignKey
ALTER TABLE "numbers" ADD CONSTRAINT "numbers_idCompany_fkey" FOREIGN KEY ("idCompany") REFERENCES "organizations"("idCompany") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numbers" ADD CONSTRAINT "numbers_idOperator_fkey" FOREIGN KEY ("idOperator") REFERENCES "operators"("idOperator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numbers" ADD CONSTRAINT "numbers_idBdo_fkey" FOREIGN KEY ("idBdo") REFERENCES "bdo"("idRegister") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bdo" ADD CONSTRAINT "bdo_idOperator_fkey" FOREIGN KEY ("idOperator") REFERENCES "operators"("idOperator") ON DELETE SET NULL ON UPDATE CASCADE;
