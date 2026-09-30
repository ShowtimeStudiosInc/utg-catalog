import { RecordEditor } from "@/components/record-editor";

export default async function EditAbilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecordEditor entity="abilities" id={id} />;
}
