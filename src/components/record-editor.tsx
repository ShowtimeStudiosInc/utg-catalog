"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type EntityType = "characters" | "abilities" | "items";
type Field = { name: string; label: string; group: string; kind?: "textarea" | "number" | "select" | "list"; options?: string[] };

const definitions: Record<EntityType, Field[]> = {
  characters: [
    { name: "name", label: "Name", group: "Main information" }, { name: "aliases", label: "Aliases", group: "Main information" },
    { name: "gender", label: "Gender", group: "Main information" }, { name: "age", label: "Age", group: "Main information", kind: "number" },
    { name: "species", label: "Species", group: "Main information" }, { name: "groupOrganization", label: "Organization", group: "Main information" },
    { name: "role", label: "Role", group: "Main information" }, { name: "submitter", label: "Submitter", group: "Main information" }, { name: "submitterRole", label: "Submitter role", group: "Main information" },
    { name: "personality", label: "Personality", group: "Behavior", kind: "textarea" }, { name: "likes", label: "Likes", group: "Behavior", kind: "textarea" },
    { name: "dislikes", label: "Dislikes", group: "Behavior", kind: "textarea" }, { name: "fears", label: "Fears", group: "Behavior", kind: "textarea" },
    { name: "traumas", label: "Traumas", group: "Behavior", kind: "textarea" }, { name: "psychologicalOddities", label: "Psychological/Neurological Oddities", group: "Behavior", kind: "textarea" },
    { name: "sexuality", label: "Sexuality", group: "Behavior" }, { name: "alignment", label: "Alignment", group: "Behavior" },
    { name: "soulTrait", label: "Soul trait", group: "Capabilities", kind: "select", options: ["Individuality", "Patience", "Bravery", "Integrity", "Perseverance", "Kindness", "Justice"] },
    { name: "mainAbility", label: "Main ability", group: "Capabilities" }, { name: "mainAbilityType", label: "Main ability type", group: "Capabilities" },
    { name: "mainAbilityDesc", label: "Main ability description", group: "Capabilities", kind: "textarea" }, { name: "subAbilities", label: "Sub abilities", group: "Capabilities", kind: "textarea" },
    { name: "subAbilityDescs", label: "Sub ability descriptions", group: "Capabilities", kind: "textarea" }, { name: "weaknesses", label: "Weaknesses", group: "Capabilities", kind: "textarea" },
    ...["hp", "wpr", "atk", "def", "edr", "spd", "love", "exp"].map((name) => ({ name, label: name.toUpperCase(), group: "Stats", kind: "number" as const })),
    ...["weapon", "weapon2", "armor", "accessory1", "accessory2"].map((name) => ({ name, label: name, group: "Equipment" })),
    { name: "height", label: "Height", group: "Appearance" }, { name: "weight", label: "Weight", group: "Appearance" },
    { name: "physicalOddities", label: "Physical oddities", group: "Appearance", kind: "textarea" }, { name: "appearanceImage", label: "Appearance image URL", group: "Appearance" },
    { name: "trivia", label: "Trivia", group: "Extras", kind: "textarea" }, { name: "ost", label: "OST", group: "Extras", kind: "textarea" },
    { name: "youtubeLinks", label: "YouTube links (one per line)", group: "Extras", kind: "textarea" }, { name: "extras", label: "Additional notes", group: "Extras", kind: "textarea" },
  ],
  abilities: [
    { name: "name", label: "Name", group: "Main information" }, { name: "parentAbility", label: "Parent abilities", group: "Main information" },
    { name: "description", label: "Description", group: "Main information", kind: "textarea" }, { name: "complexity", label: "Complexity", group: "Main information", kind: "select", options: ["Basic", "Intermediate", "Advanced", "Complex"] },
    { name: "passives", label: "Passives", group: "Components", kind: "textarea" }, { name: "skills", label: "Skills", group: "Components", kind: "textarea" },
    { name: "statChanges", label: "Stat changes", group: "Components", kind: "textarea" }, { name: "weaknesses", label: "Weaknesses", group: "Components", kind: "textarea" },
    { name: "rating", label: "Rating", group: "Classification", kind: "select", options: ["Limited", "Minor", "Base", "Enhanced", "Advanced", "Perfect"] },
    { name: "abilityType", label: "Types (comma separated)", group: "Classification", kind: "list" },
    { name: "abilityClass", label: "Classes (comma separated)", group: "Classification", kind: "list" },
  ],
  items: [
    { name: "name", label: "Name", group: "Main information" }, { name: "description", label: "Description", group: "Main information", kind: "textarea" },
    { name: "type", label: "Type", group: "Main information", kind: "select", options: ["Weapon", "Shield", "Armor", "Accessory", "Consumable", "Miscellaneous"] },
    { name: "value", label: "Value in Aurum", group: "Main information", kind: "number" }, { name: "originalOwner", label: "Original owner", group: "Main information" }, { name: "currentOwner", label: "Current owner", group: "Main information" },
    { name: "atk", label: "ATK", group: "Stats" }, { name: "hitCount", label: "Hit count", group: "Stats", kind: "number" }, { name: "def", label: "DEF", group: "Stats" },
    { name: "defendEfficiency", label: "Defend efficiency", group: "Stats", kind: "number" }, { name: "spd", label: "SPD", group: "Stats", kind: "number" },
    { name: "range", label: "Range", group: "Physical properties" }, { name: "weight", label: "Weight", group: "Physical properties" },
    { name: "physicalDamages", label: "Physical damages", group: "Physical properties", kind: "textarea" }, { name: "appearanceImage", label: "Appearance image URL", group: "Physical properties" },
  ],
};

function displayValue(record: Record<string, unknown>, field: Field): string {
  const value = record[field.name];
  if (field.name === "youtubeLinks" && typeof value === "string") {
    try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return parsed.join("\n"); } catch { /* retain legacy text */ }
  }
  if (field.kind === "list" && typeof value === "string") {
    try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return parsed.join(", "); } catch { /* retain legacy text */ }
  }
  return value == null ? "" : String(value);
}

export function RecordEditor({ entity, id }: { entity: EntityType; id: string }) {
  const router = useRouter();
  const fields = definitions[entity];
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const groups = useMemo(() => [...new Set(fields.map((field) => field.group))], [fields]);

  useEffect(() => {
    let active = true;
    fetch(`/api/${entity}/${encodeURIComponent(id)}`).then(async (response) => {
      if (!response.ok) throw new Error("Could not load this record.");
      return response.json();
    }).then((data: Record<string, unknown>) => {
      if (!active) return;
      setRecord(data);
      setValues(Object.fromEntries(fields.map((field) => [field.name, displayValue(data, field)])));
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load this record.")).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entity, fields, id]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name]?.trim() ?? "";
      if (field.kind === "number") payload[field.name] = value ? Number(value) : null;
      else if (field.kind === "list") payload[field.name] = value.split(",").map((part) => part.trim()).filter(Boolean);
      else if (field.name === "youtubeLinks") payload[field.name] = value.split(/\r?\n/).map((part) => part.trim()).filter(Boolean);
      else if ((field.kind === "select" || field.name === "appearanceImage") && !value) payload[field.name] = null;
      else payload[field.name] = value;
    }
    try {
      const response = await fetch(`/api/${entity}/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not save changes.");
      router.push(`/${entity}/${id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save changes."); setSaving(false); }
  }

  const title = entity.slice(0, -1);
  return <main className="min-h-screen bg-[#1a1a2e] pixel-border"><div className="container mx-auto px-4 py-8">
    <Button type="button" onClick={() => router.push(`/${entity}/${id}`)} className="deltarune-button mb-4 text-white">← BACK TO {title.toUpperCase()}</Button>
    <h1 className="retro-glow mb-2 text-4xl text-white">EDIT {title.toUpperCase()}</h1>
    <p className="mb-8 text-xl text-[#a0a0a0]">Changes are saved to your local catalog database.</p>
    {loading ? <p className="text-white" role="status">LOADING...</p> : record && <form onSubmit={save}>
      {groups.map((group) => <section key={group} className="deltarune-card mb-6 p-6"><h2 className="mb-4 text-2xl text-white">{group}</h2><div className="grid gap-4 md:grid-cols-2">
        {fields.filter((field) => field.group === group).map((field) => <label key={field.name} className="grid gap-2 text-white">{field.label}
          {field.kind === "textarea" ? <textarea className="deltarune-input min-h-24 bg-black p-3 text-white" value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} /> : field.kind === "select" ? <select className="deltarune-input bg-black p-3 text-white" value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}><option value="">Unspecified</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input className="deltarune-input bg-black p-3 text-white" type={field.kind === "number" ? "number" : "text"} step={field.name === "value" || field.name === "defendEfficiency" ? "0.1" : undefined} value={values[field.name] ?? ""} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />}
        </label>)}
      </div></section>)}
      {error && <p className="mb-4 border-2 border-[#ff647c] bg-black p-3 text-[#ffb4c0]" role="alert">{error}</p>}
      <div className="flex gap-4"><Button type="submit" disabled={saving} className="deltarune-button text-white">{saving ? "SAVING..." : "SAVE CHANGES"}</Button><Button type="button" onClick={() => router.push(`/${entity}/${id}`)} className="deltarune-button text-white">CANCEL</Button></div>
    </form>}
    {!loading && !record && <p className="text-[#ffb4c0]" role="alert">{error || "Record not found."}</p>}
  </div></main>;
}

export function RecordActions({ entity, id }: { entity: EntityType; id: string }) {
  const router = useRouter();
  const label = entity.slice(0, -1);
  async function remove() {
    if (!window.confirm(`Delete this ${label} permanently?`)) return;
    const response = await fetch(`/api/${entity}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      window.alert(`Could not delete this ${label}. Please try again.`);
      return;
    }
    router.push(`/${entity}`);
  }
  return <div className="mt-8 flex gap-4">
    <Button type="button" onClick={() => router.push(`/${entity}/${id}/edit`)} className="deltarune-button text-white">EDIT {label.toUpperCase()}</Button>
    <Button type="button" onClick={() => void remove()} className="deltarune-button text-white" style={{ backgroundColor: "#e94560" }}>DELETE</Button>
  </div>;
}
