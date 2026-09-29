import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";
import { customEmojiNameSchema } from "@/lib/validations";
import {
  MAX_EMOJI_BYTES,
  MAX_EMOJI_COUNT,
  saveEmoji,
  inspectEmojiImage,
  removeEmoji,
} from "@/lib/emoji-storage";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = MAX_EMOJI_BYTES + 16 * 1024;

export async function GET() {
  try {
    const emojis = await prisma.customEmoji.findMany({
      select: {
        fileName: true,
        name: true,
        mimeType: true,
        width: true,
        height: true,
        size: true,
      },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(emojis);
  } catch (error) {
    console.error("Error listing custom emojis:", error);
    return NextResponse.json({ error: "Unable to load the emoji library." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_MULTIPART_BYTES) {
    return NextResponse.json({ error: "Emoji uploads must be 1 MB or smaller." }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }
    const parsedName = customEmojiNameSchema.safeParse(formData.get("name"));
    if (!parsedName.success) {
      return NextResponse.json(
        { error: parsedName.error.issues[0]?.message || "Enter a valid emoji name." },
        { status: 400 },
      );
    }
    if (file.size === 0 || file.size > MAX_EMOJI_BYTES) {
      return NextResponse.json({ error: "Emoji images must be between 1 byte and 1 MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const image = inspectEmojiImage(bytes);
    if (!image) {
      return NextResponse.json(
        { error: "Use a valid PNG, GIF, WebP, or JPEG image up to 256 × 256 pixels." },
        { status: 415 },
      );
    }

    if ((await prisma.customEmoji.count()) >= MAX_EMOJI_COUNT) {
      return NextResponse.json(
        { error: `The emoji library can store up to ${MAX_EMOJI_COUNT} images.` },
        { status: 409 },
      );
    }

    const stored = await saveEmoji(bytes, image);
    try {
      const emoji = await prisma.customEmoji.create({
        data: {
          name: parsedName.data,
          fileName: stored.fileName,
          mimeType: stored.mimeType,
          width: stored.width,
          height: stored.height,
          size: stored.size,
        },
        select: {
          fileName: true,
          name: true,
          mimeType: true,
          width: true,
          height: true,
          size: true,
        },
      });
      return NextResponse.json(emoji, { status: 201 });
    } catch (error) {
      try {
        await removeEmoji(stored.fileName);
      } catch (cleanupError) {
        console.error("Failed to clean up an emoji upload after its library record failed:", cleanupError);
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "An emoji with this name already exists." }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error saving custom emoji:", error);
    return NextResponse.json({ error: "Unable to save this emoji." }, { status: 500 });
  }
}
