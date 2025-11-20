/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `Purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Purchases_courseId_key" ON "Purchases"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchases_userId_key" ON "Purchases"("userId");
