import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_EMOJI_BYTES = 1024 * 1024;
export const MAX_EMOJI_DIMENSION = 256;
export const MAX_EMOJI_COUNT = 250;

export type EmojiImage = {
  extension: "png" | "gif" | "jpg" | "webp";
  mimeType: "image/png" | "image/gif" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

export type StoredEmoji = EmojiImage & {
  fileName: string;
  size: number;
};

const fileNamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|gif|jpg|webp)$/i;

function readWebpDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 25 || bytes.toString("ascii", 0, 4) !== "RIFF" ||
      bytes.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunkType = bytes.toString("ascii", 12, 16);
  if (chunkType === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes.readUIntLE(24, 3),
      height: 1 + bytes.readUIntLE(27, 3),
    };
  }

  if (chunkType === "VP8L" && bytes[20] === 0x2f && bytes.length >= 25) {
    return {
      width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      height: 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10),
    };
  }

  if (
    chunkType === "VP8 " &&
    bytes.length >= 30 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }

  return null;
}

function readJpegDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const startOfFrame = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);

  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;

    if (offset + 1 >= bytes.length) return null;
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (startOfFrame.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }
  return null;
}

export function inspectEmojiImage(bytes: Buffer): EmojiImage | null {
  let image: EmojiImage | null = null;

  if (
    bytes.length >= 24 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    image = {
      extension: "png",
      mimeType: "image/png",
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  } else if (
    bytes.length >= 10 &&
    ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))
  ) {
    image = {
      extension: "gif",
      mimeType: "image/gif",
      width: bytes.readUInt16LE(6),
      height: bytes.readUInt16LE(8),
    };
  } else if (bytes.length >= 25 && bytes.toString("ascii", 0, 4) === "RIFF") {
    const dimensions = readWebpDimensions(bytes);
    if (dimensions) {
      image = { extension: "webp", mimeType: "image/webp", ...dimensions };
    }
  } else {
    const dimensions = readJpegDimensions(bytes);
    if (dimensions) {
      image = { extension: "jpg", mimeType: "image/jpeg", ...dimensions };
    }
  }

  if (
    !image ||
    image.width < 1 ||
    image.height < 1 ||
    image.width > MAX_EMOJI_DIMENSION ||
    image.height > MAX_EMOJI_DIMENSION
  ) {
    return null;
  }

  return image;
}

export function isSafeEmojiFileName(fileName: string): boolean {
  return fileNamePattern.test(fileName);
}

function getEmojiDirectory(): string {
  const configuredRoot = process.env.CATALOGER_DATA_DIR?.trim();
  if (configuredRoot) return path.join(path.resolve(configuredRoot), "custom-emojis");
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), ".cataloger-data", "custom-emojis");
  }
  throw new Error("CATALOGER_DATA_DIR must point to a writable app-data directory.");
}

export async function saveEmoji(bytes: Buffer, image: EmojiImage): Promise<StoredEmoji> {
  const directory = getEmojiDirectory();
  await mkdir(directory, { recursive: true });
  const fileName = `${randomUUID()}.${image.extension}`;
  await writeFile(path.join(directory, fileName), bytes, { flag: "wx" });
  return { ...image, fileName, size: bytes.byteLength };
}

export async function listEmojis(): Promise<StoredEmoji[]> {
  const directory = getEmojiDirectory();
  await mkdir(directory, { recursive: true });
  const names = await readdir(directory);
  const emojis: StoredEmoji[] = [];

  for (const fileName of names) {
    if (!isSafeEmojiFileName(fileName)) continue;
    const filePath = path.join(directory, fileName);
    const info = await stat(filePath);
    if (!info.isFile() || info.size > MAX_EMOJI_BYTES) continue;
    const image = inspectEmojiImage(await readFile(filePath));
    if (image) emojis.push({ ...image, fileName, size: info.size });
  }

  return emojis.sort((left, right) => left.fileName.localeCompare(right.fileName));
}

export async function readEmoji(fileName: string): Promise<{
  bytes: Buffer;
  image: EmojiImage;
} | null> {
  if (!isSafeEmojiFileName(fileName)) return null;
  try {
    const bytes = await readFile(path.join(getEmojiDirectory(), fileName));
    const image = inspectEmojiImage(bytes);
    return image ? { bytes, image } : null;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

export async function removeEmoji(fileName: string): Promise<boolean> {
  if (!isSafeEmojiFileName(fileName)) return false;
  try {
    await unlink(path.join(getEmojiDirectory(), fileName));
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}
