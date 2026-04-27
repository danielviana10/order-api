/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_externalId_key" ON "Order"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
