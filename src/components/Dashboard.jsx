import { useState } from "react";
import { AudioLines, ListTodo, AlignLeft } from "lucide-react";
import { ShieldMark } from "./Logo.jsx";
import { cn } from "../utils/classNames.js";
import { TranscriptPanel } from "./panels/TranscriptPanel.jsx";
import { ProtectedPanel } from "./panels/ProtectedPanel.jsx";
import { SummaryPanel } from "./panels/SummaryPanel.jsx";
import { ActionItemsPanel } from "./panels/ActionItemsPanel.jsx";

const TABS = [
  { id: "transcript", label: "Transcript", icon: AudioLines, Panel: TranscriptPanel },
  { id: "protected", label: "Protected", icon: ShieldMark, Panel: ProtectedPanel },
  { id: "summary", label: "Summary", icon: AlignLeft, Panel: SummaryPanel },
  { id: "actions", label: "Action items", icon: ListTodo, Panel: ActionItemsPanel },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("transcript");
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const ActivePanel = active.Panel;

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <nav className="flex shrink-0 gap-1 border-b border-ink-700 px-5 pt-3" role="tablist">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-t px-3.5 py-2.5 text-sm font-medium transition",
                isActive
                  ? "border-b-2 border-shield text-mist-100"
                  : "border-b-2 border-transparent text-mist-400 hover:text-mist-200"
              )}
            >
              <tab.icon className="h-4 w-4" strokeWidth={1.75} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <ActivePanel />
      </div>
    </section>
  );
}
