import { ListTodo } from "lucide-react";
import { EmptyState } from "../EmptyState.jsx";

export function ActionItemsPanel() {
  return (
    <EmptyState
      icon={ListTodo}
      title="No action items yet"
      description="Tasks, assignees, and deadlines mentioned in the meeting will be extracted and listed here — for example, an assignee, a task, and a deadline pulled from a single sentence."
      hint="Action-item extraction: Batch 4"
    />
  );
}
