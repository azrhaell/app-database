-- DropIndex
DROP INDEX "organizations_email1_key";

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "address" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "federalrevenue" (
    "idCompany" SERIAL NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "branchoffice" BOOLEAN DEFAULT false,
    "companyname" VARCHAR(255) DEFAULT 'Razão Social',
    "businessname" VARCHAR(255) DEFAULT 'Nome Fantasia',
    "rfstatus" VARCHAR(10),
    "daterfstatus" TIMESTAMP(3),
    "reasonrfstatus" VARCHAR(10),
    "excludedatesize" TIMESTAMP(3),
    "semaphore" VARCHAR(10),
    "serasamessage" VARCHAR(10),
    "legalnature" VARCHAR(255),
    "openingdate" TIMESTAMP(3),
    "creatorId" INTEGER NOT NULL,
    "updaterId" INTEGER,
    "disabled" BOOLEAN DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,
    "createdat" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3),
    "cnaecode" VARCHAR(10),
    "cnaedescription" VARCHAR(255),
    "cnaedescriptionsecondary" VARCHAR(255),
    "typestreet" VARCHAR(10),
    "address" VARCHAR(100) DEFAULT 'Rua A',
    "number" VARCHAR(20),
    "complement" VARCHAR(50),
    "neighborhood" VARCHAR(100),
    "cep" VARCHAR(8),
    "city" VARCHAR(100) DEFAULT 'Rio de Janeiro',
    "state" VARCHAR(2) DEFAULT 'RJ',
    "country" VARCHAR(30) DEFAULT 'Brasil',
    "ddd1" VARCHAR(2),
    "phone1" VARCHAR(13),
    "ddd2" VARCHAR(2),
    "phone2" VARCHAR(13),
    "ddd_fax" VARCHAR(2),
    "fax" VARCHAR(13),
    "email1" VARCHAR(60),
    "qualifyresponsible" VARCHAR(100),
    "capital" DOUBLE PRECISION DEFAULT 0,
    "companysize" VARCHAR(255),
    "optionalsize" BOOLEAN DEFAULT false,
    "optiondatesize" TIMESTAMP(3),
    "optionmei" BOOLEAN DEFAULT false,
    "partners" VARCHAR(255),
    "specialsituation" VARCHAR(50),
    "specialsituationdate" TIMESTAMP(3),

    CONSTRAINT "federalrevenue_pkey" PRIMARY KEY ("idCompany")
);

-- CreateIndex
CREATE INDEX "federalrevenue_cnpj_companyname_email1_phone1_idx" ON "federalrevenue"("cnpj", "companyname", "email1", "phone1");

-- AddForeignKey
ALTER TABLE "federalrevenue" ADD CONSTRAINT "federalrevenue_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "federalrevenue" ADD CONSTRAINT "federalrevenue_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;
