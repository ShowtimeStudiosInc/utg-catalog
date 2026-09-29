-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "submitter" TEXT,
    "submitterRole" TEXT,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "species" TEXT,
    "groupOrganization" TEXT,
    "role" TEXT,
    "personality" TEXT,
    "likes" TEXT,
    "dislikes" TEXT,
    "fears" TEXT,
    "traumas" TEXT,
    "psychologicalOddities" TEXT,
    "sexuality" TEXT,
    "alignment" TEXT,
    "soulTrait" TEXT,
    "mainAbility" TEXT,
    "mainAbilityType" TEXT,
    "mainAbilityDesc" TEXT,
    "subAbilities" TEXT,
    "subAbilityDescs" TEXT,
    "weaknesses" TEXT,
    "hp" INTEGER,
    "wpr" INTEGER,
    "atk" INTEGER,
    "weapon" TEXT,
    "weapon2" TEXT,
    "def" INTEGER,
    "armor" TEXT,
    "accessory1" TEXT,
    "accessory2" TEXT,
    "edr" INTEGER,
    "spd" INTEGER,
    "love" INTEGER,
    "exp" INTEGER,
    "height" TEXT,
    "weight" TEXT,
    "physicalOddities" TEXT,
    "appearanceImage" TEXT,
    "trivia" TEXT,
    "ost" TEXT,
    "extras" TEXT
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" REAL,
    "originalOwner" TEXT,
    "currentOwner" TEXT,
    "atk" TEXT,
    "hitCount" INTEGER,
    "def" TEXT,
    "defendEfficiency" REAL,
    "spd" INTEGER,
    "range" TEXT,
    "weight" TEXT,
    "physicalDamages" TEXT,
    "appearanceImage" TEXT
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "parentAbility" TEXT,
    "description" TEXT,
    "complexity" TEXT,
    "passives" TEXT,
    "skills" TEXT,
    "statChanges" TEXT,
    "weaknesses" TEXT,
    "rating" TEXT,
    "abilityType" TEXT,
    "abilityClass" TEXT
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CharacterTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "CharacterTag_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CharacterTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AbilityTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "abilityId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "AbilityTag_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AbilityTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_soulTrait_idx" ON "Character"("soulTrait");

-- CreateIndex
CREATE INDEX "Character_alignment_idx" ON "Character"("alignment");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "Item"("type");

-- CreateIndex
CREATE INDEX "Item_originalOwner_idx" ON "Item"("originalOwner");

-- CreateIndex
CREATE INDEX "Item_currentOwner_idx" ON "Item"("currentOwner");

-- CreateIndex
CREATE INDEX "Ability_name_idx" ON "Ability"("name");

-- CreateIndex
CREATE INDEX "Ability_complexity_idx" ON "Ability"("complexity");

-- CreateIndex
CREATE INDEX "Ability_rating_idx" ON "Ability"("rating");

-- CreateIndex
CREATE INDEX "Ability_abilityType_idx" ON "Ability"("abilityType");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "CharacterTag_characterId_idx" ON "CharacterTag"("characterId");

-- CreateIndex
CREATE INDEX "CharacterTag_tagId_idx" ON "CharacterTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTag_characterId_tagId_key" ON "CharacterTag"("characterId", "tagId");

-- CreateIndex
CREATE INDEX "ItemTag_itemId_idx" ON "ItemTag"("itemId");

-- CreateIndex
CREATE INDEX "ItemTag_tagId_idx" ON "ItemTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemTag_itemId_tagId_key" ON "ItemTag"("itemId", "tagId");

-- CreateIndex
CREATE INDEX "AbilityTag_abilityId_idx" ON "AbilityTag"("abilityId");

-- CreateIndex
CREATE INDEX "AbilityTag_tagId_idx" ON "AbilityTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "AbilityTag_abilityId_tagId_key" ON "AbilityTag"("abilityId", "tagId");
