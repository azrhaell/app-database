-- CreateTable
CREATE TABLE "portedslist" (
    "idPortedList" SERIAL NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "mobilephone1" VARCHAR(13) NOT NULL,
    "actualoperator" VARCHAR(50) NOT NULL,
    "previousoperator" VARCHAR(50) NOT NULL,
    "porteddate" TIMESTAMP(3),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "portedslist_pkey" PRIMARY KEY ("idPortedList")
);
