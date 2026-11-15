import type { ReactNode } from "react";

/** 부자재 그림. 실제 사진 대신 모양을 알아볼 수 있게 그린 단순한 도식이에요 (색은 globals.css 토큰) */

const body = { fill: "var(--surface)", stroke: "var(--muted)", strokeWidth: 2, strokeLinejoin: "round" as const };
const soft = { fill: "var(--subtle)", stroke: "var(--muted)", strokeWidth: 2, strokeLinejoin: "round" as const };
const accent = { fill: "var(--accent-soft)", stroke: "var(--accent)", strokeWidth: 2, strokeLinejoin: "round" as const };
const glass = { fill: "var(--export-soft)", stroke: "var(--export)", strokeWidth: 2, strokeLinejoin: "round" as const };
const line = { fill: "none", stroke: "var(--muted)", strokeWidth: 2, strokeLinecap: "round" as const };
const dash = { ...line, strokeDasharray: "4 4" };

const drawings: Record<string, ReactNode> = {
  blow: (
    <>
      <path d="M42 46 Q42 36 52 33 L52 26 H68 V33 Q78 36 78 46 V100 Q78 106 72 106 H48 Q42 106 42 100 Z" {...body} />
      <rect x="49" y="14" width="22" height="13" rx="2" {...accent} />
      <rect x="48" y="58" width="24" height="28" rx="2" {...soft} />
    </>
  ),
  "heavy-blow": (
    <>
      <rect x="34" y="44" width="52" height="62" rx="9" {...glass} />
      <rect x="44" y="54" width="32" height="42" rx="4" fill="var(--surface)" stroke="var(--export)" strokeWidth="1.5" />
      <rect x="40" y="24" width="40" height="20" rx="3" {...accent} />
      <path d="M38 50 V98" {...line} stroke="var(--export)" strokeWidth="1" />
    </>
  ),
  glass: (
    <>
      <path d="M44 50 Q44 40 53 37 V28 H67 V37 Q76 40 76 50 V102 Q76 106 72 106 H48 Q44 106 44 102 Z" {...glass} />
      <rect x="51" y="16" width="18" height="13" rx="2" {...accent} />
      <path d="M50 52 V96 M55 50 V70" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  aluminum: (
    <>
      <rect x="42" y="34" width="36" height="72" rx="6" {...soft} />
      <path d="M50 40 V100 M56 40 V100" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 40 V100" stroke="var(--muted)" strokeWidth="1" opacity="0.5" />
      <rect x="46" y="18" width="28" height="17" rx="3" {...soft} />
    </>
  ),
  dropper: (
    <>
      <path d="M44 58 Q44 50 53 48 V42 H67 V48 Q76 50 76 58 V102 Q76 106 72 106 H48 Q44 106 44 102 Z" {...glass} />
      <rect x="51" y="34" width="18" height="9" rx="2" {...soft} />
      <path d="M53 34 V22 Q53 12 60 12 Q67 12 67 22 V34 Z" {...accent} />
      <path d="M60 43 V94" stroke="var(--export)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="100" r="2.5" fill="var(--export)" />
    </>
  ),
  pump: (
    <>
      <path d="M42 56 Q42 48 52 46 V40 H68 V46 Q78 48 78 56 V102 Q78 106 74 106 H46 Q42 106 42 102 Z" {...body} />
      <rect x="51" y="32" width="18" height="9" rx="2" {...accent} />
      <rect x="56" y="22" width="8" height="10" {...accent} />
      <path d="M50 14 H66 Q70 14 70 18 V22 H50 Z" {...accent} />
      <path d="M50 17 H34 Q30 17 30 21" {...line} stroke="var(--accent)" strokeWidth="3" />
      <path d="M60 46 V100" {...dash} strokeWidth="1.5" />
    </>
  ),
  tube: (
    <>
      <path d="M40 16 H80 V22 L74 92 H46 L40 22 Z" {...body} />
      <path d="M40 22 H80" {...line} />
      <path d="M44 16 V22 M50 16 V22 M56 16 V22 M62 16 V22 M68 16 V22 M74 16 V22" stroke="var(--muted)" strokeWidth="1" />
      <rect x="48" y="40" width="24" height="30" rx="2" {...soft} />
      <rect x="47" y="92" width="26" height="16" rx="3" {...accent} />
    </>
  ),
  jar: (
    <>
      <rect x="28" y="56" width="64" height="44" rx="8" {...body} />
      <rect x="36" y="62" width="48" height="32" rx="4" {...soft} />
      <rect x="24" y="38" width="72" height="20" rx="4" {...accent} />
      <path d="M32 42 V54 M40 42 V54 M48 42 V54 M56 42 V54 M64 42 V54 M72 42 V54 M80 42 V54 M88 42 V54" stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
    </>
  ),
  spray: (
    <>
      <path d="M48 56 Q48 50 54 48 V44 H66 V48 Q72 50 72 56 V104 Q72 108 68 108 H52 Q48 108 48 104 Z" {...body} />
      <rect x="54" y="36" width="12" height="9" rx="1" {...accent} />
      <rect x="53" y="24" width="14" height="13" rx="3" {...accent} />
      <circle cx="50" cy="30" r="1.8" fill="var(--accent)" />
      <path d="M44 30 l-8 -4 M44 30 h-10 M44 30 l-8 4 M34 22 l-6 -3 M32 30 h-8 M34 38 l-6 3" {...line} strokeWidth="1.5" strokeDasharray="2 3" />
    </>
  ),
  "three-side-glued": (
    <>
      <path d="M38 22 L68 14 L88 24 L58 32 Z" {...soft} />
      <path d="M38 22 L58 32 V100 L38 90 Z" {...body} />
      <path d="M58 32 L88 24 V92 L58 100 Z" {...soft} />
      <path d="M38 90 L58 100 L88 92 L68 82 Z" {...accent} />
      <path d="M41 90 L58 98 M60 98 L85 91 M45 88 L68 84" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M92 96 l8 4" {...line} />
      <text x="100" y="112" fontSize="9" fill="var(--accent)" textAnchor="middle">접착</text>
    </>
  ),
  "lid-and-base": (
    <>
      <path d="M22 70 L60 82 L98 70 V96 L60 108 L22 96 Z" {...body} />
      <path d="M22 70 L60 58 L98 70 L60 82 Z" {...soft} />
      <path d="M22 34 L60 22 L98 34 L60 46 Z" {...accent} />
      <path d="M22 34 V44 L60 56 L98 44 V34" {...accent} />
      <path d="M60 46 V56" stroke="var(--accent)" strokeWidth="2" />
      <path d="M60 62 V54 M56 58 L60 62 L64 58" {...line} strokeWidth="1.5" transform="translate(0 -4) rotate(180 60 58)" />
    </>
  ),
  shield: (
    <>
      <path d="M20 56 L60 44 L100 56 L60 68 Z" {...soft} />
      <path d="M20 56 L60 68 V108 L20 96 Z" {...body} />
      <path d="M60 68 L100 56 V96 L60 108 Z" {...soft} />
      <path d="M32 58 L60 50 L88 58 L60 66 Z" {...accent} />
      <ellipse cx="60" cy="58" rx="9" ry="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      <path d="M51 58 V24 Q51 20 55 20 H65 Q69 20 69 24 V58" {...glass} />
      <rect x="54" y="10" width="12" height="10" rx="2" {...soft} />
    </>
  ),
  "outer-carton": (
    <>
      <path d="M16 40 L60 28 L104 40 L60 52 Z" {...soft} />
      <path d="M16 40 L60 52 V108 L16 96 Z" fill="var(--kraft)" fillOpacity="0.35" stroke="var(--muted)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 52 L104 40 V96 L60 108 Z" fill="var(--kraft)" fillOpacity="0.2" stroke="var(--muted)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 34 L82 46" stroke="var(--kraft)" strokeWidth="5" opacity="0.8" />
      <text x="82" y="80" fontSize="13" fontWeight="600" fill="var(--foreground)" textAnchor="middle">×48</text>
      <path d="M24 60 L52 68 M24 72 L52 80" {...line} strokeWidth="1" opacity="0.6" />
    </>
  ),
  "seal-label": (
    <>
      <rect x="28" y="20" width="64" height="88" rx="2" {...body} />
      <path d="M28 34 H92" {...line} />
      <rect x="52" y="14" width="16" height="44" rx="1" {...accent} />
      <path d="M52 40 l4 -3 l4 3 l4 -3 l4 3" stroke="var(--surface)" strokeWidth="2" fill="none" />
      <text x="60" y="54" fontSize="7" fontWeight="700" fill="var(--accent)" textAnchor="middle">VOID</text>
      <text x="60" y="27" fontSize="7" fontWeight="700" fill="var(--accent)" textAnchor="middle">SEAL</text>
    </>
  ),
  "shrink-film": (
    <>
      <rect x="34" y="34" width="52" height="70" rx="3" {...body} />
      <rect x="42" y="50" width="36" height="30" rx="2" {...soft} />
      <path d="M30 32 Q30 26 36 26 H84 Q90 26 90 32 V106 Q90 110 86 110 H34 Q30 110 30 106 Z" fill="var(--export-soft)" fillOpacity="0.6" stroke="var(--export)" strokeWidth="1.5" />
      <path d="M36 30 l6 4 M50 28 l3 5 M70 28 l-3 5 M84 30 l-6 4 M33 60 l4 2 M87 70 l-4 2" stroke="var(--export)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 18 q4 -6 8 0 t8 0 t8 0" fill="none" stroke="var(--warn)" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  "seeding-box": (
    <>
      <path d="M16 62 L60 74 L104 62 V98 L60 110 L16 98 Z" {...body} />
      <path d="M16 62 L60 50 L104 62 L60 74 Z" {...soft} />
      <rect x="44" y="36" width="12" height="28" rx="3" {...glass} />
      <rect x="62" y="30" width="14" height="32" rx="3" {...accent} />
      <path d="M32 46 L54 40 L58 58 L36 64 Z" fill="var(--surface)" stroke="var(--best)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 50 l12 -3 M39 55 l9 -2" stroke="var(--best)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 68 L82 80 M82 56 L38 68" stroke="var(--sale)" strokeWidth="3" opacity="0.6" />
    </>
  ),
};

export function TermIllustration({ id, label }: { id: string; label: string }) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={`${label} 그림`} className="h-full w-full">
      {drawings[id] ?? <rect x="30" y="30" width="60" height="60" rx="6" {...soft} />}
    </svg>
  );
}
