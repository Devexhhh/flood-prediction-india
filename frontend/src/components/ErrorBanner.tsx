import { AlertTriangle, X } from "lucide-react";

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="error-banner">
      <AlertTriangle size={18} />{" "}
      <div>
        <strong>Backend connection issue</strong>
        <p>
          {message}. Confirm the FastAPI server is running on port 8000 and
          project assets exist.
        </p>
      </div>
      <button onClick={onDismiss}>
        <X size={16} />
      </button>
    </div>
  );
}
