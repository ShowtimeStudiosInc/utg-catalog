import Image from "next/image";
import { ABILITY_CLASSES, ABILITY_TYPES } from "@/lib/ability-classification";

export type AbilityClassificationCategory = "rating" | "type" | "class";
export { ABILITY_CLASSES, ABILITY_TYPES };

export function AbilityClassificationImage({
  category,
  value,
  size = 28,
}: {
  category: AbilityClassificationCategory;
  value: string;
  size?: number;
}) {
  return (
    <Image
      src={`/images/ability-classification/${category}/${encodeURIComponent(value)}.png`}
      alt=""
      title={value}
      width={128}
      height={128}
      className="ability-classification-image"
      style={{ width: size, height: size }}
    />
  );
}

export function AbilityClassificationOption({
  category,
  value,
  size = 28,
}: {
  category: AbilityClassificationCategory;
  value: string;
  size?: number;
}) {
  return (
    <span className="ability-classification-option">
      <AbilityClassificationImage category={category} value={value} size={size} />
      <span>{value}</span>
    </span>
  );
}

export function AbilityClassificationPicker({
  category,
  options,
  value,
  onChange,
}: {
  category: "type" | "class";
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  return (
    <div className="ability-classification-picker" role="group" aria-label={`Ability ${category}`}>
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`ability-classification-choice${selected ? " is-selected" : ""}`}
            aria-pressed={selected}
            onClick={() => toggle(option)}
          >
            <AbilityClassificationOption category={category} value={option} size={34} />
          </button>
        );
      })}
    </div>
  );
}
