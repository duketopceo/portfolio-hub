/**
 * Quadrant graph positions for each project.
 * X-axis: Backend/Data (-1) ← → Frontend/UI (+1)
 * Y-axis: Utility/Tool (-1) ← → Platform/System (+1)
 *
 * Quadrant labels:
 *   Top-Left:     Data Platforms (backend + platform)
 *   Top-Right:    Product Systems (frontend + platform)
 *   Bottom-Left:  Backend Utilities (backend + tool)
 *   Bottom-Right: User Tools (frontend + tool)
 */
export const quadrantPositions: Record<string, { x: number; y: number }> = {
  "trading-bot":       { x: -0.60, y:  0.55 },
  "alphahedge":        { x:  0.25, y:  0.65 },
  "ikbr-dashboard":    { x:  0.15, y: -0.35 },
  "finance-frenzy":    { x:  0.50, y: -0.10 },
  "skyguard-ai":       { x: -0.25, y:  0.75 },
  "quiz-the-best":     { x:  0.65, y: -0.45 },
  "optimezer":         { x: -0.35, y:  0.20 },
  "republic-atlas":    { x:  0.05, y:  0.85 },
  "military-hardware-db": { x: -0.55, y: -0.50 },
  "etl-pipeline":      { x: -0.70, y: -0.70 },
  "server-cluster":    { x: -0.80, y:  0.45 },
  "dixi":              { x:  0.70, y:  0.15 },
  "stratum-hq":        { x:  0.55, y:  0.28 },
  "chronicle-weaver":  { x:  0.80, y:  0.00 },
  "collaborative-essay": { x: 0.30, y: -0.70 },
  "personal-blog":     { x:  0.80, y: -0.65 },
  "series65-study-app": { x: 0.35, y:  0.70 },
  "curious-storycard": { x:  0.75, y: -0.30 },
  "nem-stock-pitch":   { x:  0.40, y:  0.40 },
};

export const quadrantLabels = {
  topLeft:     "Data Platforms",
  topRight:    "Product Systems",
  bottomLeft:  "Backend Utilities",
  bottomRight: "User Tools",
};

export const axisLabels = {
  left:   "Backend / Data",
  right:  "Frontend / UI",
  top:    "Platform / System",
  bottom: "Utility / Tool",
};
