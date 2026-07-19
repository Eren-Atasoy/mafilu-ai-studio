import { useId } from "react";

export type SketchTvVariant = "tv" | "arcade" | "monitor";

interface SketchTvProps {
  variant?: SketchTvVariant;
  /** Ekran içi: statik parazit yerine fosfor yeşili boş ekran */
  isLit?: boolean;
  className?: string;
}

/**
 * El çizimi CRT cihaz SVG'si — feTurbulence + feDisplacementMap ile
 * karakalem çizgi titremesi (Take On Me "boil" hissi). Placeholder sanat;
 * ileride AI üretimi görsellerle değiştirilebilir.
 */
export function SketchTv({ variant = "tv", isLit = false, className }: SketchTvProps) {
  const uid = useId().replace(/[:]/g, "");
  const wobbleId = `wobble-${uid}`;
  const hatchId = `hatch-${uid}`;

  const stroke = "var(--lp-pencil)";
  const strokeBright = "var(--lp-ink)";
  const screenFill = isLit ? "oklch(0.35 0.09 145)" : "oklch(0.14 0.005 95)";

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <filter id={wobbleId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
        </filter>
        <pattern id={hatchId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={stroke} strokeWidth="0.8" opacity="0.4" />
        </pattern>
      </defs>

      <g filter={`url(#${wobbleId})`} strokeLinecap="round" strokeLinejoin="round">
        {variant === "tv" && (
          <>
            {/* Gövde */}
            <rect x="22" y="42" width="156" height="118" rx="10" stroke={strokeBright} strokeWidth="2.4" />
            <rect x="22" y="42" width="156" height="118" rx="10" fill={`url(#${hatchId})`} opacity="0.35" />
            {/* Ekran */}
            <rect x="36" y="56" width="104" height="90" rx="14" fill={screenFill} stroke={strokeBright} strokeWidth="2" />
            {/* Kontrol paneli */}
            <circle cx="159" cy="76" r="7" stroke={stroke} strokeWidth="1.8" />
            <circle cx="159" cy="100" r="7" stroke={stroke} strokeWidth="1.8" />
            <line x1="150" y1="122" x2="168" y2="122" stroke={stroke} strokeWidth="1.8" />
            <line x1="150" y1="130" x2="168" y2="130" stroke={stroke} strokeWidth="1.8" />
            {/* Anten */}
            <line x1="80" y1="42" x2="58" y2="12" stroke={strokeBright} strokeWidth="2" />
            <line x1="110" y1="42" x2="138" y2="10" stroke={strokeBright} strokeWidth="2" />
            <circle cx="56" cy="10" r="3" stroke={stroke} strokeWidth="1.5" />
            {/* Ayaklar */}
            <line x1="48" y1="160" x2="40" y2="176" stroke={strokeBright} strokeWidth="2.2" />
            <line x1="152" y1="160" x2="160" y2="176" stroke={strokeBright} strokeWidth="2.2" />
          </>
        )}

        {variant === "arcade" && (
          <>
            {/* Kabin */}
            <path d="M48 190 L48 60 L70 24 L130 24 L152 60 L152 190 Z" stroke={strokeBright} strokeWidth="2.4" />
            <path d="M48 190 L48 60 L70 24 L130 24 L152 60 L152 190 Z" fill={`url(#${hatchId})`} opacity="0.3" />
            {/* Tepe panel */}
            <rect x="66" y="30" width="68" height="16" rx="3" stroke={stroke} strokeWidth="1.6" />
            {/* Ekran */}
            <rect x="62" y="58" width="76" height="58" rx="6" fill={screenFill} stroke={strokeBright} strokeWidth="2" />
            {/* Kontrol yüzeyi */}
            <path d="M56 130 L144 130 L152 148 L48 148 Z" stroke={stroke} strokeWidth="1.8" />
            <circle cx="82" cy="139" r="4.5" stroke={strokeBright} strokeWidth="1.8" />
            <line x1="82" y1="134" x2="86" y2="126" stroke={strokeBright} strokeWidth="1.8" />
            <circle cx="112" cy="139" r="3.4" stroke={stroke} strokeWidth="1.6" />
            <circle cx="126" cy="139" r="3.4" stroke={stroke} strokeWidth="1.6" />
            {/* Jeton yuvası */}
            <rect x="90" y="158" width="20" height="14" rx="2" stroke={stroke} strokeWidth="1.5" />
            <line x1="100" y1="161" x2="100" y2="169" stroke={stroke} strokeWidth="1.4" />
          </>
        )}

        {variant === "monitor" && (
          <>
            {/* Gövde */}
            <rect x="30" y="40" width="140" height="104" rx="8" stroke={strokeBright} strokeWidth="2.4" />
            <rect x="30" y="40" width="140" height="104" rx="8" fill={`url(#${hatchId})`} opacity="0.3" />
            {/* Ekran */}
            <rect x="42" y="52" width="116" height="80" rx="10" fill={screenFill} stroke={strokeBright} strokeWidth="2" />
            {/* Boyun + taban */}
            <path d="M88 144 L84 162 L116 162 L112 144" stroke={strokeBright} strokeWidth="2.2" />
            <line x1="62" y1="170" x2="138" y2="170" stroke={strokeBright} strokeWidth="2.4" />
            {/* Güç ışığı */}
            <circle cx="158" cy="150" r="2.6" fill={isLit ? "var(--lp-phosphor)" : "none"} stroke={stroke} strokeWidth="1.4" />
          </>
        )}
      </g>
    </svg>
  );
}
