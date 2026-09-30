"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

type Emoji = { fileName: string; name: string };

async function fetchEmojis(): Promise<Emoji[]> {
  const response = await fetch("/api/emojis");
  if (!response.ok) throw new Error("Could not load the emoji library.");
  return response.json();
}

export function CustomEmojiText({ text }: { text: string }) {
  const { data: emojis = [] } = useQuery({
    queryKey: ["custom-emojis"],
    queryFn: fetchEmojis,
    staleTime: 60_000,
  });
  const emojiByName = new Map(emojis.map((emoji) => [emoji.name.toLowerCase(), emoji]));
  const parts = text.split(/:([a-zA-Z0-9_-]{1,32}):/g);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return part;
        const emoji = emojiByName.get(part.toLowerCase());
        return emoji ? (
          <Image
            key={`${emoji.fileName}-${index}`}
            src={`/api/emojis/${encodeURIComponent(emoji.fileName)}`}
            alt={`:${emoji.name}:`}
            title={`:${emoji.name}:`}
            width={20}
            height={20}
            unoptimized
            className="custom-emoji-inline"
          />
        ) : `:${part}:`;
      })}
    </>
  );
}
