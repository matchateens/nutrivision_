# NutriVision - AI Development Design Document

This document serves as the absolute source of truth for any AI Assistant (Cursor, Copilot, Windsurf, etc.) or developer modifying the NutriVision codebase. **Read this entirely before making any code suggestions or modifications.**

## 1. Core Identity
- **Project Name**: NutriVision ID (Formerly NutriMap)
- **Domain**: National Nutrition Intelligence & MBG (Makan Bergizi Gratis) Simulator.
- **Vibe/Aesthetic**: Premium, Intelligence/Military-grade Dashboard, Futuristic, Clean, and Data-Driven.

## 2. Technology Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks (useState, useEffect) - Keep it simple, no Redux unless explicitly requested.
- **Animations**: Framer Motion (`framer-motion`)
- **Icons**: Lucide React (`lucide-react`)
- **Charts**: Recharts (`recharts`)
- **Mapping**: React Simple Maps (`react-simple-maps`) & d3-geo.

## 3. Design System & Styling Rules (CRITICAL)

### Color Palette (Tailwind Classes)
- **Background (Global)**: `#020617` (Extremely dark blue/slate). Use `bg-[#020617]` or `bg-slate-950`.
- **Card Backgrounds**: Glassmorphism effect ONLY. Use `bg-slate-900/50` or `bg-slate-800/30` combined with `backdrop-blur-xl`.
- **Primary Accent**: Emerald (`emerald-400` / `emerald-500`). Used for positive metrics, active states, and primary buttons.
- **Secondary Accents**: 
  - Indigo (`indigo-400` / `indigo-500`) for tech/AI features.
  - Amber (`amber-400`) for warnings/wasting data.
  - Red (`red-400` / `red-500`) for critical data (high stunting) or negative gaps.
- **Text**: `text-white` for primary headings, `text-slate-400` or `text-slate-500` for subtitles and muted text.

### UI Components (Glassmorphism & Borders)
- NEVER use solid white backgrounds.
- All panels and cards MUST have subtle borders: `border border-slate-800/50`.
- Rounded corners are mandatory: Use `rounded-xl`, `rounded-2xl`, or `rounded-3xl` depending on container size.
- Drop shadows should be soft and colored if highlighting: `shadow-[0_0_15px_rgba(16,185,129,0.1)]`.

### Typography
- Headings: Use `font-black` and `tracking-tight` for large metrics.
- Overlines/Labels: Use extremely small, bold, tracking-widest uppercase text (e.g., `text-[9px] uppercase tracking-[0.2em] font-bold`).

## 4. Coding Conventions
- **Component Structure**: Functional components using Arrow Functions.
- **Responsiveness**: Mobile-first approach. Use grid configurations that collapse gracefully (e.g., `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`).
- **Data Handling**: All core nutrition data is sourced from `src/data/nutritionData.json`. Do not hardcode data inside components; always map over the JSON data.

## 5. Map Interaction Rules (React Simple Maps)
- The map relies on `indonesia-province.json` (TopoJSON).
- Hover states on the map should use CSS `filter: brightness(1.3)` rather than changing the base SVG fill color, to preserve the dynamic data-driven color scale.
- Drill-down functionality is driven by the `PROV_TO_SLUG` mapping dictionary.

## 6. Prohibited Actions
- DO NOT suggest adding bulky UI libraries (like Material UI, Ant Design, or Bootstrap). Stick purely to Tailwind CSS.
- DO NOT remove the `framer-motion` `<AnimatePresence>` wrappers during refactors.
- DO NOT suggest external AI API integrations unless the user explicitly bypasses the "Stable Mode" rule.

---
**End of Design Document.** Follow these rules strictly to maintain the "Triple-Threat Vibe" of the application.
