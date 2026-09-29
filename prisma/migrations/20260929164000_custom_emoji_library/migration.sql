CREATE TABLE "CustomEmoji" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "CustomEmoji_fileName_key" ON "CustomEmoji"("fileName");
CREATE UNIQUE INDEX "CustomEmoji_name_key" ON "CustomEmoji"("name");
