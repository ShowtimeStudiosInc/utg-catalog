import Image from "next/image";
import { getSoulTraitSprite } from "@/lib/soul-traits";

type SoulTraitIconProps = {
  trait: string | null | undefined;
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
};

export function SoulTraitIcon({
  trait,
  size = 18,
  className = "",
  showText = false,
  textClassName = "",
}: SoulTraitIconProps) {
  const sprite = getSoulTraitSprite(trait);

  if (!sprite || !trait) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`.trim()}>
      <Image
        src={sprite.path}
        alt={`${trait} soul trait`}
        aria-label={`${trait} soul trait`}
        width={size}
        height={size}
        className="soul-trait-icon"
      />
      {showText && <span className={textClassName}>{trait}</span>}
    </span>
  );
}
