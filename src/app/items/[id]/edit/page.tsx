import { RecordEditor } from "@/components/record-editor";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecordEditor entity="items" id={id} />;
}
