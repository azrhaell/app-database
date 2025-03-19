-- CreateTable
CREATE TABLE "states" (
    "idState" SERIAL NOT NULL,
    "name" VARCHAR(2) NOT NULL DEFAULT 'XX',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "states_pkey" PRIMARY KEY ("idState")
);

-- CreateTable
CREATE TABLE "companysizes" (
    "idCompanySize" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'Nome',
    "description" VARCHAR(255),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "companysizes_pkey" PRIMARY KEY ("idCompanySize")
);

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companysizes_name_key" ON "companysizes"("name");
