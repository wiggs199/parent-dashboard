import { FolderClosed } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { EmptyState } from "../components/ui";

export default function Documents() {
  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Therapist, school, and insurance paperwork — kept together per child."
      />
      <EmptyState icon={FolderClosed} title="Document uploads are coming soon">
        Soon you'll be able to attach files to a child and pull them up when a
        school or insurer asks.
      </EmptyState>
    </div>
  );
}
