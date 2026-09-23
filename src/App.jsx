import { TopBar } from "./components/TopBar.jsx";
import { ControlRail } from "./components/ControlRail.jsx";
import { Dashboard } from "./components/Dashboard.jsx";

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-ink-900 md:flex-row">
      {/* Capture controls come first in the DOM (and stack on top on small
          screens) so the primary action — record or upload — is reachable
          immediately, before the (initially empty) dashboard. */}
      <ControlRail />
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar />
        <Dashboard />
      </div>
    </div>
  );
}
