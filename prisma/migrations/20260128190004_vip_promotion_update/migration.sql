/*
  Warnings:

  - You are about to drop the column `productId` on the `Promotion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_productId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "birthday" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "promotionId" TEXT,
ALTER COLUMN "barcode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "productId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "salesGoal" DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
