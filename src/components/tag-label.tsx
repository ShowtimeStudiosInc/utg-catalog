import Image from "next/image";

type TagLabelProps = {
  name: string;
  emojiFilename?: string | null;
};

export function TagLabel({ name, emojiFilename }: TagLabelProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {emojiFilename && (
        <Image
          className="tag-emoji"
          src={`/api/emojis/${encodeURIComponent(emojiFilename)}`}
          alt=""
          aria-hidden
          width={20}
          height={20}
          unoptimized
        />
      )}
      <span>{name}</span>
    </span>
  );
}
