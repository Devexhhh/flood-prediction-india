import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  className?: string;
}

// --- REMIX ICON LIBRARY ---
export function RiDashboardLine({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function RiFloodLine({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 13c1.5-1 3.5-1 5 0 1.5 1 3.5 1 5 0 1.5-1 3.5-1 5 0 1.5 1 3.5 1 4 0" />
      <path d="M3 17c1.5-1 3.5-1 5 0 1.5 1 3.5 1 5 0 1.5-1 3.5-1 5 0 1.5 1 3.5 1 4 0" />
      <path d="M3 21c1.5-1 3.5-1 5 0 1.5 1 3.5 1 5 0 1.5-1 3.5-1 5 0 1.5 1 3.5 1 4 0" />
      <path d="M12 3v5" />
      <path d="M9.5 5.5L12 3l2.5 2.5" />
    </svg>
  );
}

export function RiWaterDropLine({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

export function RiEarthLine({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M11.5 3a17 17 0 0 0 0 18" />
      <path d="M12.5 3a17 17 0 0 1 0 18" />
    </svg>
  );
}

export function RiCpuLine({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M1 9h3" />
      <path d="M1 15h3" />
      <path d="M20 9h3" />
      <path d="M20 15h3" />
    </svg>
  );
}

// --- TABLER ICON LIBRARY ---
export function TbRadar({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M21 12h-8a1 1 0 1 0-1 1v8a9 9 0 0 0 9-9" />
      <path d="M16 9a5 5 0 1 0-7 7" />
      <path d="M20.486 9A9 9 0 1 0 9 20.485" />
    </svg>
  );
}

export function TbDatabaseExport({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.657 3.582 3 8 3" />
      <path d="M4 12v6c0 1.657 3.582 3 8 3" />
      <path d="M16 17l5-5" />
      <path d="M21 12h-6" />
      <path d="M21 12v6" />
    </svg>
  );
}

export function TbWaterRipple({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 12c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
      <path d="M3 17c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
      <path d="M3 7c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
    </svg>
  );
}

export function TbAlertOctagon({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// --- PHOSPHOR ICON LIBRARY ---
export function PhGauge({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 21a9 9 0 1 1 9-9c0 1.03-.17 2.02-.5 2.94" />
      <circle cx="12" cy="12" r="2" />
      <path d="M13.41 10.59L17.5 6.5" />
      <path d="M3.27 15.5A8.96 8.96 0 0 1 3 12" />
    </svg>
  );
}

export function PhTrendUp({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function PhCheckCircle({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export function PhMapPin({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

// --- HEROICONS LIBRARY ---
export function HiMagnifyingGlass({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function HiAdjustmentsHorizontal({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="4" y1="6" x2="14" y2="6" />
      <line x1="18" y1="6" x2="20" y2="6" />
      <circle cx="16" cy="6" r="2" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <line x1="12" y1="12" x2="20" y2="12" />
      <circle cx="10" cy="12" r="2" />
      <line x1="4" y1="18" x2="16" y2="18" />
      <line x1="20" y1="18" x2="20" y2="18" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function HiArrowsPointingOut({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="15 3 21 3 21 9" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function HiArrowUpRight({ size = 16, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function HiXMark({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function HiPulse({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function HiCloudRain({ size = 18, color = "currentColor", className = "", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <line x1="8" y1="21" x2="8" y2="23" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="16" y1="21" x2="16" y2="23" />
    </svg>
  );
}
