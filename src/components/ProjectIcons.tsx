/**
 * Unique SVG mini-logos for each project.
 * Geometric, minimal marks — 24x24 viewBox, currentColor strokes.
 */

interface IconProps {
  className?: string;
  size?: number;
}

function Icon({ className, size = 24, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {children}
    </svg>
  );
}

/** TradingBot — candlestick chart with upward arrow */
export function TradingBotIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="8" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.3" />
      <line x1="5.5" y1="5" x2="5.5" y2="19" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="4" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.5" />
      <line x1="11.5" y1="2" x2="11.5" y2="19" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="6" width="3" height="8" rx="0.5" fill="currentColor" opacity="0.3" />
      <line x1="17.5" y1="3" x2="17.5" y2="17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 18L10 11L14 14L21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6H21V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

/** AlphaHedge — shield with alpha symbol */
export function AlphaHedgeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2L3 7V12C3 17 7 21.3 12 22C17 21.3 21 17 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="700" fontFamily="serif">α</text>
    </Icon>
  );
}

/** IBKR Dashboard — bar chart in monitor */
export function IBKRDashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="9" width="2" height="5" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="10" y="7" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="14" y="10" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
    </Icon>
  );
}

/** Finance Frenzy — trophy / game controller mashup */
export function FinanceFrenzyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 2H16V6C16 9.31 13.31 12 10 12H14C10.69 12 8 9.31 8 6V2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
      <path d="M8 4H5C4 4 3 5 3 6C3 7.5 4 8 5 8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 4H19C20 4 21 5 21 6C21 7.5 20 8 19 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 19H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="3" r="2" fill="currentColor" opacity="0.4" />
    </Icon>
  );
}

/** SkyGuard AI — brain with lightning bolt */
export function SkyGuardAIIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2C8 2 5 5 5 8.5C5 11 6.5 13 8.5 14V17H15.5V14C17.5 13 19 11 19 8.5C19 5 16 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <line x1="9" y1="17" x2="9" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="17" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 7L11 11H14L11 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

/** QuizTheBest — question mark in speech bubble */
export function QuizTheBestIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4H20V16H13L8 20V16H4V4Z" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.06" />
      <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="700">?</text>
    </Icon>
  );
}

/** OptiMezer — gear with arrow */
export function OptiMezerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 1V4M12 20V23M1 12H4M20 12H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.2 4.2L6.3 6.3M17.7 17.7L19.8 19.8M4.2 19.8L6.3 17.7M17.7 6.3L19.8 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 10L16 8M16 8H13.5M16 8V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

/** Republic Atlas — globe with grid lines */
export function RepublicAtlasIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M3.5 7.5H20.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M3.5 16.5H20.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="14" cy="8" r="1.5" fill="currentColor" opacity="0.5" />
    </Icon>
  );
}

/** Military Hardware DB — crosshair / radar */
export function MilitaryHardwareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.04" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

/** ETL Pipeline — pipes / flow */
export function ETLPipelineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="4" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="4" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="20" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="10" y="9" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M6.5 6H10M6.5 18H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 12H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

/** Production Cluster — server stack */
export function ServerClusterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="2" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
      <circle cx="6" cy="5" r="1" fill="currentColor" opacity="0.5" />
      <line x1="9" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <rect x="3" y="9" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
      <circle cx="6" cy="12" r="1" fill="currentColor" opacity="0.7" />
      <line x1="9" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <rect x="3" y="16" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
      <circle cx="6" cy="19" r="1" fill="currentColor" opacity="0.5" />
      <line x1="9" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    </Icon>
  );
}

/** Dixi — code brackets with heart */
export function DixiIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 4L3 12L8 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4L21 12L16 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8L10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

/** Chronicle Weaver — open book with branching paths */
export function ChronicleWeaverIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 4C2 4 5 3 8 3C11 3 12 4 12 4V20C12 20 11 19 8 19C5 19 2 20 2 20V4Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <path d="M22 4C22 4 19 3 16 3C13 3 12 4 12 4V20C12 20 13 19 16 19C19 19 22 20 22 20V4Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <circle cx="7" cy="9" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="7" cy="13" r="1" fill="currentColor" opacity="0.4" />
      <path d="M15 8L17 10L15 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </Icon>
  );
}

/** Collaborative Essay — two cursors writing */
export function CollaborativeEssayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.04" />
      <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <line x1="7" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <line x1="7" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <line x1="7" y1="17" x2="11" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      {/* Cursor 1 */}
      <path d="M14 11V17L16 15.5L17.5 18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

/** Technical Blog — terminal with text */
export function TechnicalBlogIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <line x1="2" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="5" cy="5" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="7.5" cy="5" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="10" cy="5" r="0.8" fill="currentColor" opacity="0.3" />
      <path d="M6 11L9 13.5L6 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="11" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </Icon>
  );
}

/** Master lookup */
export const projectIconMap: Record<string, React.FC<IconProps>> = {
  "trading-bot": TradingBotIcon,
  "alphahedge": AlphaHedgeIcon,
  "ikbr-dashboard": IBKRDashboardIcon,
  "finance-frenzy": FinanceFrenzyIcon,
  "skyguard-ai": SkyGuardAIIcon,
  "quiz-the-best": QuizTheBestIcon,
  "optimezer": OptiMezerIcon,
  "republic-atlas": RepublicAtlasIcon,
  "military-hardware-db": MilitaryHardwareIcon,
  "etl-pipeline": ETLPipelineIcon,
  "server-cluster": ServerClusterIcon,
  "dixi": DixiIcon,
  "chronicle-weaver": ChronicleWeaverIcon,
  "collaborative-essay": CollaborativeEssayIcon,
  "personal-blog": TechnicalBlogIcon,
};
