import { prisma } from "@/lib/db";
import { isSafeEmojiFileName, readEmoji, removeEmoji } from "@/lib/emoji-storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  try {
    const { fileName } = await params;
    if (!isSafeEmojiFileName(fileName)) {
      return new Response("Emoji not found.", { status: 404 });
    }
    const record = await prisma.customEmoji.findUnique({
      where: { fileName },
      select: { mimeType: true },
    });
    if (!record) return new Response("Emoji not found.", { status: 404 });
    const emoji = await readEmoji(fileName);
    if (!emoji) return new Response("Emoji not found.", { status: 404 });

    return new Response(Uint8Array.from(emoji.bytes), {
      headers: {
        "Content-Type": record.mimeType,
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving custom emoji:", error);
    return NextResponse.json({ error: "Unable to serve this emoji." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  try {
    const { fileName } = await params;
    if (!isSafeEmojiFileName(fileName)) {
      return NextResponse.json({ error: "Invalid emoji identifier." }, { status: 400 });
    }

    const record = await prisma.customEmoji.findUnique({
      where: { fileName },
      select: { fileName: true },
    });
    if (!record) {
      return NextResponse.json({ error: "Emoji not found." }, { status: 404 });
    }

    const assignedTag = await prisma.tag.findFirst({ where: { emojiFilename: fileName } });
    if (assignedTag) {
      return NextResponse.json(
        { error: `Remove this emoji from the “${assignedTag.name}” tag before deleting it.` },
        { status: 409 },
      );
    }

    await removeEmoji(fileName);
    await prisma.customEmoji.delete({ where: { fileName } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom emoji:", error);
    return NextResponse.json({ error: "Unable to delete this emoji." }, { status: 500 });
  }
}
