import { AlertTriangle, RotateCw, X } from "lucide-react";
import { PulseDot } from "../../components/magicui";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function LoadingState({ slow = false }: { slow?: boolean }) {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
      {slow ? (
        <Card className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[13px] text-muted-foreground">
          <PulseDot className="text-accent" />
          Waking up the prediction API. The free server sleeps when idle and can take up to a minute to start.
        </Card>
      ) : (
        <span className="sr-only">Loading station data…</span>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[118px] animate-pulse rounded-[14px] border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[440px] animate-pulse rounded-2xl border border-border bg-card lg:col-span-2" />
        <div className="h-[440px] animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card role="alert" className="flex items-start gap-3 rounded-[14px] p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-risk-soft text-risk">
        <AlertTriangle size={17} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <strong className="text-sm font-medium">Couldn’t reach the prediction API</strong>
        <p className="m-0 text-[13px] text-muted-foreground">
          {message}. If the server was asleep, retrying in a moment usually works.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw size={14} /> Retry
      </Button>
      <Button variant="ghost" size="sm" className="w-8 px-0" onClick={onDismiss} aria-label="Dismiss">
        <X size={15} />
      </Button>
    </Card>
  );
}
