-- CreateTable
CREATE TABLE "tenants" (
    "idTenant" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "version" INTEGER DEFAULT 0,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("idTenant")
);

-- CreateTable
CREATE TABLE "users" (
    "idUser" SERIAL NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'Nome',
    "surname" VARCHAR(50),
    "completename" VARCHAR(150),
    "password" VARCHAR(64) NOT NULL,
    "comments" VARCHAR(255),
    "idUserType" INTEGER NOT NULL DEFAULT 2,
    "idRole" INTEGER NOT NULL DEFAULT 1,
    "idSector" INTEGER NOT NULL DEFAULT 1,
    "idTeam" INTEGER NOT NULL DEFAULT 1,
    "superiorId" INTEGER,
    "address" VARCHAR(100) NOT NULL DEFAULT 'Rua A',
    "number" VARCHAR(20),
    "complement" VARCHAR(50),
    "neighborhood" VARCHAR(50) NOT NULL,
    "city" VARCHAR(30) NOT NULL DEFAULT 'Rio de Janeiro',
    "state" VARCHAR(2) NOT NULL DEFAULT 'RJ',
    "country" VARCHAR(20) NOT NULL DEFAULT 'Brasil',
    "cep" VARCHAR(8),
    "email1" VARCHAR(60) NOT NULL,
    "mobile_phone1" VARCHAR(13) NOT NULL,
    "mobile_phone2" VARCHAR(13),
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "updaterId" INTEGER,
    "suspendedat" TIMESTAMP(3),
    "suspenderId" INTEGER,
    "inactivatedat" TIMESTAMP(3),
    "inactivatorId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "pathphoto" TEXT,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "validatedat" TIMESTAMP(3),
    "validationexpires" TIMESTAMP(3),
    "wordkey" TEXT NOT NULL DEFAULT 'Paravra-Secreta',
    "birthdate" TIMESTAMP(3),
    "hiringdate" TIMESTAMP(3),
    "email2" VARCHAR(60),
    "email3" VARCHAR(60),
    "mobile_phone3" VARCHAR(13),
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("idUser")
);

-- CreateTable
CREATE TABLE "persons" (
    "idPerson" SERIAL NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'Nome',
    "surname" VARCHAR(50),
    "completename" VARCHAR(150),
    "address" VARCHAR(100) NOT NULL DEFAULT 'Rua A',
    "number" VARCHAR(20),
    "complement" VARCHAR(50),
    "neighborhood" VARCHAR(50) NOT NULL,
    "city" VARCHAR(30) NOT NULL DEFAULT 'Rio de Janeiro',
    "state" VARCHAR(2) NOT NULL DEFAULT 'RJ',
    "country" VARCHAR(20) NOT NULL DEFAULT 'Brasil',
    "cep" VARCHAR(8),
    "email1" VARCHAR(60) NOT NULL,
    "mobile_phone1" VARCHAR(13) NOT NULL,
    "mobile_phone2" VARCHAR(13),
    "roleincompany" VARCHAR(20),
    "idsectormanager" INTEGER DEFAULT 1,
    "idteamsupervisor" INTEGER DEFAULT 1,
    "idowner" INTEGER NOT NULL DEFAULT 1,
    "idnegotiator" INTEGER DEFAULT 1,
    "idresponsible" INTEGER DEFAULT 1,
    "creatorId" INTEGER NOT NULL,
    "updaterId" INTEGER,
    "suspenderId" INTEGER,
    "inactivatorId" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "suspendedat" TIMESTAMP(3),
    "inactivatedat" TIMESTAMP(3),
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "comercial_phone1" VARCHAR(13),
    "comercial_phone2" VARCHAR(13),
    "comercial_phone3" VARCHAR(13),
    "comercial_phone4" VARCHAR(13),
    "comercial_phone5" VARCHAR(13),
    "email2" VARCHAR(60),
    "email3" VARCHAR(60),
    "email4" VARCHAR(60),
    "email5" VARCHAR(60),
    "facebook" VARCHAR(60),
    "idTag" INTEGER DEFAULT 1,
    "instagram" VARCHAR(60),
    "linkedin" VARCHAR(60),
    "mobile_phone3" VARCHAR(13),
    "mobile_phone4" VARCHAR(13),
    "mobile_phone5" VARCHAR(13),
    "residential_phone1" VARCHAR(13),
    "residential_phone2" VARCHAR(13),
    "residential_phone3" VARCHAR(13),
    "residential_phone4" VARCHAR(13),
    "residential_phone5" VARCHAR(13),
    "twitter" VARCHAR(60),
    "website" VARCHAR(60),
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("idPerson")
);

-- CreateTable
CREATE TABLE "organizations" (
    "idCompany" SERIAL NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "statenumber" VARCHAR(14),
    "municipalnumber" VARCHAR(14),
    "duns" VARCHAR(9),
    "companyname" VARCHAR(100) NOT NULL DEFAULT 'Razão Social',
    "businessname" VARCHAR(100) DEFAULT 'Nome Fantasia',
    "branchoffice" BOOLEAN NOT NULL DEFAULT false,
    "isclient" BOOLEAN NOT NULL DEFAULT false,
    "idClient" VARCHAR(20),
    "idManager" INTEGER NOT NULL,
    "idContact" INTEGER,
    "idTag" INTEGER DEFAULT 1,
    "address" VARCHAR(100) NOT NULL DEFAULT 'Rua A',
    "number" VARCHAR(20),
    "complement" VARCHAR(50),
    "neighborhood" VARCHAR(50) NOT NULL,
    "city" VARCHAR(30) NOT NULL DEFAULT 'Rio de Janeiro',
    "state" VARCHAR(2) NOT NULL DEFAULT 'RJ',
    "country" VARCHAR(20) NOT NULL DEFAULT 'Brasil',
    "cep" VARCHAR(8),
    "email1" VARCHAR(60) NOT NULL,
    "email2" VARCHAR(60),
    "email3" VARCHAR(60),
    "email4" VARCHAR(60),
    "email5" VARCHAR(60),
    "linkedin" VARCHAR(60),
    "instagram" VARCHAR(60),
    "facebook" VARCHAR(60),
    "twitter" VARCHAR(60),
    "website" VARCHAR(60),
    "mobile_phone1" VARCHAR(13) NOT NULL,
    "mobile_phone2" VARCHAR(13),
    "mobile_phone3" VARCHAR(13),
    "mobile_phone4" VARCHAR(13),
    "mobile_phone5" VARCHAR(13),
    "comercial_phone1" VARCHAR(13),
    "comercial_phone2" VARCHAR(13),
    "comercial_phone3" VARCHAR(13),
    "comercial_phone4" VARCHAR(13),
    "comercial_phone5" VARCHAR(13),
    "nextactivitydate" TIMESTAMP(3),
    "numberlines" INTEGER DEFAULT 0,
    "fidelity" TIMESTAMP(3),
    "blcoverage" VARCHAR(10) DEFAULT '0',
    "actualactivelineoperator" VARCHAR(10) DEFAULT '0',
    "idOperator" INTEGER DEFAULT 1,
    "linepropensitywithcompetition" VARCHAR(10) DEFAULT '0',
    "monthbilling" DOUBLE PRECISION DEFAULT 0,
    "mobilecredits" INTEGER DEFAULT 0,
    "tower" VARCHAR(10),
    "businessarea" VARCHAR(20),
    "rfstatus" VARCHAR(10),
    "semaphore" VARCHAR(10),
    "serasamessage" VARCHAR(10),
    "idrelatedorganizations" INTEGER,
    "openingdate" TIMESTAMP(3),
    "idsectormanager" INTEGER NOT NULL DEFAULT 1,
    "idteamsupervisor" INTEGER NOT NULL DEFAULT 1,
    "idowner" INTEGER NOT NULL DEFAULT 1,
    "idnegotiator" INTEGER DEFAULT 1,
    "idresponsible" INTEGER DEFAULT 1,
    "creatorId" INTEGER NOT NULL,
    "updaterId" INTEGER,
    "suspenderId" INTEGER,
    "inactivatorId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("idCompany")
);

-- CreateTable
CREATE TABLE "UsersFlwrPersons" (
    "idUser" INTEGER NOT NULL,
    "idPerson" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersFlwrPersons_pkey" PRIMARY KEY ("idUser","idPerson")
);

-- CreateTable
CREATE TABLE "UsersViewPersons" (
    "idUser" INTEGER NOT NULL,
    "idPerson" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersViewPersons_pkey" PRIMARY KEY ("idUser","idPerson")
);

-- CreateTable
CREATE TABLE "UsersFlwrDeals" (
    "idUser" INTEGER NOT NULL,
    "idDeal" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersFlwrDeals_pkey" PRIMARY KEY ("idUser","idDeal")
);

-- CreateTable
CREATE TABLE "UsersFlwrFunnels" (
    "idUser" INTEGER NOT NULL,
    "idFunnel" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersFlwrFunnels_pkey" PRIMARY KEY ("idUser","idFunnel")
);

-- CreateTable
CREATE TABLE "UsersFlwrOrganizations" (
    "idUser" INTEGER NOT NULL,
    "idCompany" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersFlwrOrganizations_pkey" PRIMARY KEY ("idUser","idCompany")
);

-- CreateTable
CREATE TABLE "UsersViewDeals" (
    "idUser" INTEGER NOT NULL,
    "idDeal" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersViewDeals_pkey" PRIMARY KEY ("idUser","idDeal")
);

-- CreateTable
CREATE TABLE "UsersViewFunnels" (
    "idUser" INTEGER NOT NULL,
    "idFunnel" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersViewFunnels_pkey" PRIMARY KEY ("idUser","idFunnel")
);

-- CreateTable
CREATE TABLE "UsersViewOrganizations" (
    "idUser" INTEGER NOT NULL,
    "idCompany" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" INTEGER NOT NULL,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "UsersViewOrganizations_pkey" PRIMARY KEY ("idUser","idCompany")
);

-- CreateTable
CREATE TABLE "activities" (
    "idActivity" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "timedateactivity" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "content" VARCHAR(50) NOT NULL,
    "idDeal" INTEGER NOT NULL,
    "idPerson" INTEGER NOT NULL,
    "idCompany" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "updaterId" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("idActivity")
);

-- CreateTable
CREATE TABLE "archives" (
    "idFile" SERIAL NOT NULL,
    "namefile" VARCHAR(60) NOT NULL,
    "description" VARCHAR(60),
    "pathfile" TEXT NOT NULL,
    "idDeal" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "updaterId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "archives_pkey" PRIMARY KEY ("idFile")
);

-- CreateTable
CREATE TABLE "currency" (
    "idCurrency" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL DEFAULT 'Nome',
    "code" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "symbol" VARCHAR(3) NOT NULL DEFAULT 'R$',
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("idCurrency")
);

-- CreateTable
CREATE TABLE "deals" (
    "idDeal" SERIAL NOT NULL,
    "title" VARCHAR(20) NOT NULL,
    "description" VARCHAR(40),
    "dealvalue" DOUBLE PRECISION DEFAULT 0,
    "idCurrency" INTEGER DEFAULT 1,
    "idTag" INTEGER DEFAULT 1,
    "probability" INTEGER DEFAULT 0,
    "idPerson" INTEGER NOT NULL,
    "idCompany" INTEGER NOT NULL,
    "idPreviousStage" INTEGER,
    "idActualStage" INTEGER NOT NULL,
    "idsectormanager" INTEGER NOT NULL DEFAULT 1,
    "idteamsupervisor" INTEGER NOT NULL DEFAULT 1,
    "idowner" INTEGER NOT NULL DEFAULT 1,
    "idnegotiator" INTEGER DEFAULT 1,
    "idresponsible" INTEGER DEFAULT 1,
    "expectedclosingdate" TIMESTAMP(3),
    "simplifique" VARCHAR(10),
    "customerorigin" VARCHAR(10),
    "portabilitydate" TIMESTAMP(3),
    "portabilityhour" TIMESTAMP(3),
    "segment" VARCHAR(10),
    "adabas" VARCHAR(10),
    "freelancerconsultant" VARCHAR(10),
    "quotation" DOUBLE PRECISION,
    "order1" VARCHAR(10),
    "order2" VARCHAR(10),
    "salesorder" VARCHAR(10),
    "inputdate" TIMESTAMP(3),
    "quality" VARCHAR(10),
    "freshbase" VARCHAR(10),
    "deliverydate" TIMESTAMP(3),
    "factor" VARCHAR(10),
    "typeorder" VARCHAR(10),
    "idbkoresponsible" INTEGER,
    "installationdate" TIMESTAMP(3),
    "installationhour" TIMESTAMP(3),
    "ellegibleqts" INTEGER DEFAULT 0,
    "penquantity" INTEGER DEFAULT 0,
    "boxquantity" INTEGER DEFAULT 0,
    "fwtquantity" INTEGER DEFAULT 0,
    "highrevenue" INTEGER DEFAULT 0,
    "pnrevenue" DOUBLE PRECISION DEFAULT 0,
    "penrevenue" DOUBLE PRECISION DEFAULT 0,
    "boxrevenue" DOUBLE PRECISION DEFAULT 0,
    "fwtrevenue" DOUBLE PRECISION DEFAULT 0,
    "mobiles" VARCHAR(10),
    "mobilevalues" DOUBLE PRECISION DEFAULT 0,
    "quantityblvoice" INTEGER DEFAULT 0,
    "blquantity" INTEGER DEFAULT 0,
    "migrationquantity" INTEGER DEFAULT 0,
    "trade" VARCHAR(10),
    "officepacketquantity" INTEGER DEFAULT 0,
    "vgequantity" INTEGER DEFAULT 0,
    "blvoicerevenue" DOUBLE PRECISION DEFAULT 0,
    "blrevenue" DOUBLE PRECISION DEFAULT 0,
    "advancedfixedrevenue" DOUBLE PRECISION DEFAULT 0,
    "migrationrevenue" DOUBLE PRECISION DEFAULT 0,
    "blmigrationquatity" INTEGER DEFAULT 0,
    "officerevenue" DOUBLE PRECISION DEFAULT 0,
    "vgerevenue" DOUBLE PRECISION DEFAULT 0,
    "blmigrationrevenue" DOUBLE PRECISION DEFAULT 0,
    "servicesactivation" VARCHAR(10),
    "servicesactivationrevenue" DOUBLE PRECISION DEFAULT 0,
    "dealgainat" TIMESTAMP(3),
    "deallostat" TIMESTAMP(3),
    "iddealsituation" INTEGER NOT NULL DEFAULT 1,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3),
    "updaterId" INTEGER,
    "inactivatedat" TIMESTAMP(3),
    "inactivatorId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("idDeal")
);

-- CreateTable
CREATE TABLE "dealsituation" (
    "idDealSituation" SERIAL NOT NULL,
    "content" VARCHAR(15) NOT NULL,
    "comment" VARCHAR(30),
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "dealsituation_pkey" PRIMARY KEY ("idDealSituation")
);

-- CreateTable
CREATE TABLE "funnels" (
    "idFunnel" SERIAL NOT NULL,
    "name" VARCHAR(15) NOT NULL,
    "description" VARCHAR(20),
    "probability" INTEGER DEFAULT 0,
    "idsectormanager" INTEGER NOT NULL DEFAULT 1,
    "idteamsupervisor" INTEGER NOT NULL DEFAULT 1,
    "idteam" INTEGER NOT NULL,
    "idpreviousfunnel" INTEGER,
    "idnextfunnel" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3),
    "updaterId" INTEGER,
    "inactivatedat" TIMESTAMP(3),
    "inactivatorId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "funnels_pkey" PRIMARY KEY ("idFunnel")
);

-- CreateTable
CREATE TABLE "logchanges" (
    "idLog" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "idDeal" INTEGER,
    "content" TEXT NOT NULL,
    "changedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER DEFAULT 0,
    "title" VARCHAR(15) NOT NULL,

    CONSTRAINT "logchanges_pkey" PRIMARY KEY ("idLog")
);

-- CreateTable
CREATE TABLE "notecomments" (
    "idComment" SERIAL NOT NULL,
    "textcomment" TEXT NOT NULL,
    "idNote" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "updaterId" INTEGER,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "notecomments_pkey" PRIMARY KEY ("idComment")
);

-- CreateTable
CREATE TABLE "notes" (
    "idNote" SERIAL NOT NULL,
    "textnote" TEXT NOT NULL,
    "idDeal" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3) NOT NULL,
    "updaterId" INTEGER,
    "tofix" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("idNote")
);

-- CreateTable
CREATE TABLE "operators" (
    "idOperator" SERIAL NOT NULL,
    "name" VARCHAR(10) NOT NULL DEFAULT 'Nome',
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,
    "code" VARCHAR(3) NOT NULL DEFAULT '00',

    CONSTRAINT "operators_pkey" PRIMARY KEY ("idOperator")
);

-- CreateTable
CREATE TABLE "roles" (
    "idRole" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "ascenderId" INTEGER DEFAULT 0,
    "subordinateId" INTEGER DEFAULT 0,
    "permissions" INTEGER[] DEFAULT ARRAY[0]::INTEGER[],
    "accesslevel" INTEGER NOT NULL DEFAULT 0,
    "description" VARCHAR(255),
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("idRole")
);

-- CreateTable
CREATE TABLE "sectors" (
    "idSector" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("idSector")
);

-- CreateTable
CREATE TABLE "stages" (
    "idStage" SERIAL NOT NULL,
    "name" VARCHAR(15) NOT NULL,
    "description" VARCHAR(20),
    "probability" INTEGER DEFAULT 0,
    "stagnation" BOOLEAN NOT NULL DEFAULT false,
    "daystostagnate" INTEGER DEFAULT 0,
    "idfunnel" INTEGER NOT NULL,
    "idpreviousstage" INTEGER,
    "idnextstage" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" INTEGER NOT NULL,
    "updatedat" TIMESTAMP(3),
    "updaterId" INTEGER,
    "inactivatedat" TIMESTAMP(3),
    "inactivatorId" INTEGER,
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("idStage")
);

-- CreateTable
CREATE TABLE "tags" (
    "idTag" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL DEFAULT 'Nome',
    "color" VARCHAR(11) NOT NULL DEFAULT '#000000',
    "disabled" BOOLEAN NOT NULL DEFAULT true,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("idTag")
);

-- CreateTable
CREATE TABLE "teams" (
    "idTeam" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("idTeam")
);

-- CreateTable
CREATE TABLE "usertypes" (
    "idUserType" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" VARCHAR(255),
    "permissions" INTEGER[] DEFAULT ARRAY[0]::INTEGER[],
    "accesslevel" INTEGER NOT NULL DEFAULT 0,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "pendant" BOOLEAN DEFAULT false,
    "version" INTEGER DEFAULT 0,

    CONSTRAINT "usertypes_pkey" PRIMARY KEY ("idUserType")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_name_key" ON "tenants"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_email1_key" ON "users"("email1");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_phone1_key" ON "users"("mobile_phone1");

-- CreateIndex
CREATE INDEX "users_cpf_name_email1_mobile_phone1_idx" ON "users"("cpf", "name", "email1", "mobile_phone1");

-- CreateIndex
CREATE UNIQUE INDEX "persons_cpf_key" ON "persons"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "persons_email1_key" ON "persons"("email1");

-- CreateIndex
CREATE UNIQUE INDEX "persons_mobile_phone1_key" ON "persons"("mobile_phone1");

-- CreateIndex
CREATE INDEX "persons_cpf_name_email1_mobile_phone1_idx" ON "persons"("cpf", "name", "email1", "mobile_phone1");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email1_key" ON "organizations"("email1");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_mobile_phone1_key" ON "organizations"("mobile_phone1");

-- CreateIndex
CREATE INDEX "organizations_cnpj_companyname_email1_mobile_phone1_idx" ON "organizations"("cnpj", "companyname", "email1", "mobile_phone1");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_name_key" ON "sectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "usertypes_name_key" ON "usertypes"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_idRole_fkey" FOREIGN KEY ("idRole") REFERENCES "roles"("idRole") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_idSector_fkey" FOREIGN KEY ("idSector") REFERENCES "sectors"("idSector") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_idTeam_fkey" FOREIGN KEY ("idTeam") REFERENCES "teams"("idTeam") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_idUserType_fkey" FOREIGN KEY ("idUserType") REFERENCES "usertypes"("idUserType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_superiorId_fkey" FOREIGN KEY ("superiorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_suspenderId_fkey" FOREIGN KEY ("suspenderId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idTag_fkey" FOREIGN KEY ("idTag") REFERENCES "tags"("idTag") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idnegotiator_fkey" FOREIGN KEY ("idnegotiator") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idowner_fkey" FOREIGN KEY ("idowner") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idresponsible_fkey" FOREIGN KEY ("idresponsible") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idsectormanager_fkey" FOREIGN KEY ("idsectormanager") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_idteamsupervisor_fkey" FOREIGN KEY ("idteamsupervisor") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_suspenderId_fkey" FOREIGN KEY ("suspenderId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idContact_fkey" FOREIGN KEY ("idContact") REFERENCES "persons"("idPerson") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idManager_fkey" FOREIGN KEY ("idManager") REFERENCES "persons"("idPerson") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idOperator_fkey" FOREIGN KEY ("idOperator") REFERENCES "operators"("idOperator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idTag_fkey" FOREIGN KEY ("idTag") REFERENCES "tags"("idTag") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idnegotiator_fkey" FOREIGN KEY ("idnegotiator") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idowner_fkey" FOREIGN KEY ("idowner") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idrelatedorganizations_fkey" FOREIGN KEY ("idrelatedorganizations") REFERENCES "organizations"("idCompany") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idresponsible_fkey" FOREIGN KEY ("idresponsible") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idsectormanager_fkey" FOREIGN KEY ("idsectormanager") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_idteamsupervisor_fkey" FOREIGN KEY ("idteamsupervisor") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_suspenderId_fkey" FOREIGN KEY ("suspenderId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrPersons" ADD CONSTRAINT "UsersFlwrPersons_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrPersons" ADD CONSTRAINT "UsersFlwrPersons_idPerson_fkey" FOREIGN KEY ("idPerson") REFERENCES "persons"("idPerson") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrPersons" ADD CONSTRAINT "UsersFlwrPersons_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewPersons" ADD CONSTRAINT "UsersViewPersons_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewPersons" ADD CONSTRAINT "UsersViewPersons_idPerson_fkey" FOREIGN KEY ("idPerson") REFERENCES "persons"("idPerson") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewPersons" ADD CONSTRAINT "UsersViewPersons_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrDeals" ADD CONSTRAINT "UsersFlwrDeals_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrDeals" ADD CONSTRAINT "UsersFlwrDeals_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrDeals" ADD CONSTRAINT "UsersFlwrDeals_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrFunnels" ADD CONSTRAINT "UsersFlwrFunnels_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrFunnels" ADD CONSTRAINT "UsersFlwrFunnels_idFunnel_fkey" FOREIGN KEY ("idFunnel") REFERENCES "funnels"("idFunnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrFunnels" ADD CONSTRAINT "UsersFlwrFunnels_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrOrganizations" ADD CONSTRAINT "UsersFlwrOrganizations_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrOrganizations" ADD CONSTRAINT "UsersFlwrOrganizations_idCompany_fkey" FOREIGN KEY ("idCompany") REFERENCES "organizations"("idCompany") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersFlwrOrganizations" ADD CONSTRAINT "UsersFlwrOrganizations_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewDeals" ADD CONSTRAINT "UsersViewDeals_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewDeals" ADD CONSTRAINT "UsersViewDeals_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewDeals" ADD CONSTRAINT "UsersViewDeals_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewFunnels" ADD CONSTRAINT "UsersViewFunnels_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewFunnels" ADD CONSTRAINT "UsersViewFunnels_idFunnel_fkey" FOREIGN KEY ("idFunnel") REFERENCES "funnels"("idFunnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewFunnels" ADD CONSTRAINT "UsersViewFunnels_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewOrganizations" ADD CONSTRAINT "UsersViewOrganizations_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewOrganizations" ADD CONSTRAINT "UsersViewOrganizations_idCompany_fkey" FOREIGN KEY ("idCompany") REFERENCES "organizations"("idCompany") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersViewOrganizations" ADD CONSTRAINT "UsersViewOrganizations_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_idCompany_fkey" FOREIGN KEY ("idCompany") REFERENCES "organizations"("idCompany") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_idPerson_fkey" FOREIGN KEY ("idPerson") REFERENCES "persons"("idPerson") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archives" ADD CONSTRAINT "archives_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idActualStage_fkey" FOREIGN KEY ("idActualStage") REFERENCES "stages"("idStage") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idCompany_fkey" FOREIGN KEY ("idCompany") REFERENCES "organizations"("idCompany") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idCurrency_fkey" FOREIGN KEY ("idCurrency") REFERENCES "currency"("idCurrency") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idPerson_fkey" FOREIGN KEY ("idPerson") REFERENCES "persons"("idPerson") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idPreviousStage_fkey" FOREIGN KEY ("idPreviousStage") REFERENCES "stages"("idStage") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idTag_fkey" FOREIGN KEY ("idTag") REFERENCES "tags"("idTag") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idbkoresponsible_fkey" FOREIGN KEY ("idbkoresponsible") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_iddealsituation_fkey" FOREIGN KEY ("iddealsituation") REFERENCES "dealsituation"("idDealSituation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idnegotiator_fkey" FOREIGN KEY ("idnegotiator") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idowner_fkey" FOREIGN KEY ("idowner") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idresponsible_fkey" FOREIGN KEY ("idresponsible") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idsectormanager_fkey" FOREIGN KEY ("idsectormanager") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_idteamsupervisor_fkey" FOREIGN KEY ("idteamsupervisor") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_idnextfunnel_fkey" FOREIGN KEY ("idnextfunnel") REFERENCES "funnels"("idFunnel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_idpreviousfunnel_fkey" FOREIGN KEY ("idpreviousfunnel") REFERENCES "funnels"("idFunnel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_idsectormanager_fkey" FOREIGN KEY ("idsectormanager") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_idteam_fkey" FOREIGN KEY ("idteam") REFERENCES "teams"("idTeam") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_idteamsupervisor_fkey" FOREIGN KEY ("idteamsupervisor") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logchanges" ADD CONSTRAINT "logchanges_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logchanges" ADD CONSTRAINT "logchanges_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notecomments" ADD CONSTRAINT "notecomments_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notecomments" ADD CONSTRAINT "notecomments_idNote_fkey" FOREIGN KEY ("idNote") REFERENCES "notes"("idNote") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notecomments" ADD CONSTRAINT "notecomments_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_idDeal_fkey" FOREIGN KEY ("idDeal") REFERENCES "deals"("idDeal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_ascenderId_fkey" FOREIGN KEY ("ascenderId") REFERENCES "roles"("idRole") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_subordinateId_fkey" FOREIGN KEY ("subordinateId") REFERENCES "roles"("idRole") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("idUser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_idfunnel_fkey" FOREIGN KEY ("idfunnel") REFERENCES "funnels"("idFunnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_idnextstage_fkey" FOREIGN KEY ("idnextstage") REFERENCES "stages"("idStage") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_idpreviousstage_fkey" FOREIGN KEY ("idpreviousstage") REFERENCES "stages"("idStage") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_inactivatorId_fkey" FOREIGN KEY ("inactivatorId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("idUser") ON DELETE SET NULL ON UPDATE CASCADE;
