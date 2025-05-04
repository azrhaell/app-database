-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "ported" BOOLEAN DEFAULT false,
ADD COLUMN     "previousoperator" VARCHAR(50);
