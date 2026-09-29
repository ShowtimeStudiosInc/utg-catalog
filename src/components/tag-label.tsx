type TagLabelProps = {
  name: string;
  emojiFilename?: string | null;
};

export function TagLabel({ name, emojiFilename }: TagLabelProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {emojiFilename && (
        <img
          className="tag-emoji"
          src={`/api/emojis/${encodeURIComponent(emojiFilename)}`}
          alt=""
          aria-hidden="true"
        />
      )}
      <span>{name}</span>
    </span>
  );
}
