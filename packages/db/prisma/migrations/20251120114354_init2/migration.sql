/*
  Warnings:

  - Added the required column `calenderNotionId` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "calenderNotionId" TEXT NOT NULL;
