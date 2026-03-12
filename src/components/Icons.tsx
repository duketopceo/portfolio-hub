/**
 * Minimal SVG icon set — no emoji, no external deps.
 * Each icon is 20x20 with 1.5px stroke.
 */

interface IconProps {
  className?: string;
}

export function ChartIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17V8l4 4 4-7 6 6" />
    </svg>
  );
}

export function CpuIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="12" height="12" rx="1.5" />
      <rect x="7" y="7" width="6" height="6" rx="0.5" />
      <path d="M7 1v3M13 1v3M7 16v3M13 16v3M1 7h3M16 7h3M1 13h3M16 13h3" />
    </svg>
  );
}

export function SearchIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" />
    </svg>
  );
}

export function DatabaseIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="10" cy="5" rx="7" ry="2.5" />
      <path d="M3 5v10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V5" />
      <path d="M3 10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" />
    </svg>
  );
}

export function ServerIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="5" rx="1" />
      <rect x="2" y="12" width="16" height="5" rx="1" />
      <circle cx="5" cy="5.5" r="0.75" fill="currentColor" />
      <circle cx="5" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function GlobeIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16" />
      <path d="M10 2c2.5 2.5 3.5 5 3.5 8s-1 5.5-3.5 8c-2.5-2.5-3.5-5-3.5-8s1-5.5 3.5-8z" />
    </svg>
  );
}

export function LockIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="8" rx="1.5" />
      <path d="M7 9V6a3 3 0 016 0v3" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M12 6l4 4-4 4" />
    </svg>
  );
}

export function ExternalIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4H4v12h12v-4" />
      <path d="M11 3h6v6" />
      <path d="M17 3L9 11" />
    </svg>
  );
}

export function SunIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v2M10 16v2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 11.5A7 7 0 018.5 3 7.5 7.5 0 1017 11.5z" />
    </svg>
  );
}

export function MenuIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

export function CloseIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function CheckIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8" />
    </svg>
  );
}

export function ChevronIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l6 6-6 6" />
    </svg>
  );
}

/**
 * Get the category icon component by name.
 */
export function getCategoryIcon(iconName: string, className?: string) {
  const props = { className: className || "w-5 h-5" };
  switch (iconName) {
    case "chart": return <ChartIcon {...props} />;
    case "cpu": return <CpuIcon {...props} />;
    case "search": return <SearchIcon {...props} />;
    case "database": return <DatabaseIcon {...props} />;
    case "server": return <ServerIcon {...props} />;
    case "globe": return <GlobeIcon {...props} />;
    default: return <GlobeIcon {...props} />;
  }
}
