import { NextResponse } from "next/server";
import {
  listEmojis,
  MAX_EMOJI_BYTES,
  MAX_EMOJI_COUNT,
  saveEmoji,
  inspectEmojiImage,
} from "@/lib/emoji-storage";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = MAX_EMOJI_BYTES + 16 * 1024;

export async function GET() {
  try {
    return NextResponse.json(await listEmojis());
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

    if ((await listEmojis()).length >= MAX_EMOJI_COUNT) {
      return NextResponse.json(
        { error: `The emoji library can store up to ${MAX_EMOJI_COUNT} images.` },
        { status: 409 },
      );
    }

    const emoji = await saveEmoji(bytes, image);
    return NextResponse.json(emoji, { status: 201 });
  } catch (error) {
    console.error("Error saving custom emoji:", error);
    return NextResponse.json({ error: "Unable to save this emoji." }, { status: 500 });
  }
}
