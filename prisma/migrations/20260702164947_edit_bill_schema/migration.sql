/*
  Warnings:

  - A unique constraint covering the columns `[userId,addressId,year,month]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `period` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `month` on the `Bill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `Bill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "period" TIMESTAMP(3) NOT NULL,
DROP COLUMN "month",
ADD COLUMN     "month" INTEGER NOT NULL,
DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bill_userId_addressId_year_month_key" ON "Bill"("userId", "addressId", "year", "month");
