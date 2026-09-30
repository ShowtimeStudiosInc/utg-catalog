CREATE TABLE "EntityLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "EntityLink_sourceType_sourceId_targetType_targetId_key"
ON "EntityLink"("sourceType", "sourceId", "targetType", "targetId");

CREATE INDEX "EntityLink_sourceType_sourceId_idx"
ON "EntityLink"("sourceType", "sourceId");

CREATE INDEX "EntityLink_targetType_targetId_idx"
ON "EntityLink"("targetType", "targetId");
