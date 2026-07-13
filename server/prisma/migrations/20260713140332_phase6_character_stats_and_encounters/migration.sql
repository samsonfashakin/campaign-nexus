/*
  Warnings:

  - A unique constraint covering the columns `[campaignId,characterId]` on the table `CampaignCharacter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "alignment" TEXT,
ADD COLUMN     "armorClass" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "background" TEXT,
ADD COLUMN     "charisma" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "constitution" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "currentHp" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "dexterity" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "intelligence" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "maxHp" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "speed" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "strength" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "temporaryHp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wisdom" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "description" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterMonster" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "monsterIndex" TEXT NOT NULL,
    "customName" TEXT,
    "maxHp" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "notes" TEXT,
    "initiative" INTEGER,

    CONSTRAINT "EncounterMonster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignCharacter_campaignId_characterId_key" ON "CampaignCharacter"("campaignId", "characterId");

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterMonster" ADD CONSTRAINT "EncounterMonster_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
