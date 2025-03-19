-- AlterTable
ALTER TABLE "listfiles" ADD COLUMN     "version" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "operators" (
    "idOperator" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'Nome',
    "description" VARCHAR(255),
    "codeoperador" VARCHAR(2),
    "codeantel" VARCHAR(2),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("idOperator")
);

-- CreateTable
CREATE TABLE "codeddd" (
    "idDDD" SERIAL NOT NULL,
    "ddd" VARCHAR(2) NOT NULL DEFAULT '21',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "codeddd_pkey" PRIMARY KEY ("idDDD")
);

-- CreateTable
CREATE TABLE "legalnatures" (
    "idLegalNature" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT 'Nome',
    "description" VARCHAR(255),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "legalnatures_pkey" PRIMARY KEY ("idLegalNature")
);
