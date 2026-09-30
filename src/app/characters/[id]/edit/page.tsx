import { RecordEditor } from "@/components/record-editor";

export default async function EditCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecordEditor entity="characters" id={id} />;
}
