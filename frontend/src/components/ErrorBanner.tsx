import { TbAlertOctagon, HiXMark } from "./icons";

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="error-banner">
      <span className="error-icon-wrap">
        <TbAlertOctagon size={18} color="#ef4444" />
      </span>
      <div className="error-text">
        <strong>Telemetry Gateway Notice</strong>
        <p>
          {message}. Check backend API service connectivity.
        </p>
      </div>
      <button className="glass-icon-btn close-btn" onClick={onDismiss} aria-label="Dismiss error">
        <HiXMark size={16} color="#e4e4e7" />
      </button>
    </div>
  );
}
