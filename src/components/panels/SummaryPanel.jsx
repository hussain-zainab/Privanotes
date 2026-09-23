import { AlignLeft } from "lucide-react";
import { EmptyState } from "../EmptyState.jsx";

export function SummaryPanel() {
  return (
    <EmptyState
      icon={AlignLeft}
      title="No summary yet"
      description="A local summary of the meeting will be generated here once a transcript exists — starting with a reliable extractive method."
      hint="Summarization: Batch 4"
    />
  );
}
