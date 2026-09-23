import { ShieldMark } from "../Logo.jsx";
import { EmptyState } from "../EmptyState.jsx";

export function ProtectedPanel() {
  return (
    <EmptyState
      icon={ShieldMark}
      title="Privacy Shield not active yet"
      description="Card numbers, phone numbers, emails, and other sensitive details will be detected and automatically masked here, once a transcript exists to scan."
      hint="Privacy Shield (PII detection + redaction): Batch 3"
    />
  );
}
