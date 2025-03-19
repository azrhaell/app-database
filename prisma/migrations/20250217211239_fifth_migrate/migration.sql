-- CreateTable
CREATE TABLE "listfiles" (
    "idFile" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "path" VARCHAR(255),
    "qtdregisters" INTEGER DEFAULT 0,
    "extension" VARCHAR(10) DEFAULT '',
    "origin" VARCHAR(10) DEFAULT '',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),
    "sincronized" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listfiles_pkey" PRIMARY KEY ("idFile")
);
