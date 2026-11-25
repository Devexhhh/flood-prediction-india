import { cn } from "../../lib/utils";

export function Logo({ className, href = "#/" }: { className?: string; href?: string }) {
  return (
    <a
      href={href}
      className={cn("flex items-center gap-2.5 text-[15px] font-semibold tracking-tight", className)}
    >
      <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          <path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          <path d="M12 3v5" />
        </svg>
      </span>
      RiverWatch
    </a>
  );
}
