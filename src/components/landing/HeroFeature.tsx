"use client";

import { forwardRef } from "react";
import { SynthFrame } from "./SynthFrame";

const REVEAL_COLS = 10;
const REVEAL_ROWS = 6;

/** Deterministik kırmızı kare seçimi (hydration güvenli) */
function isRedCell(index: number): boolean {
  const hash = Math.sin(index * 91.7) * 43758.5453;
  return hash - Math.floor(hash) < 0.15;
}

interface HeroFeatureProps {
  /** İlk vitrin videosu; yoksa sentetik synthwave karesi gösterilir */
  videoSrc: string | null;
}

/**
 * Hero'nun merkezindeki sinematik kare. Üstündeki mini piksel grid'i
 * başta kareyi örter; tabela sol üste yerleşirken HeroSection'daki
 * ScrollTrigger hücreleri dalga halinde söndürüp kareyi açar.
 * animos.app videosu hazır olunca public/showcase'e atmak yeterli.
 */
export const HeroFeature = forwardRef<HTMLDivElement, HeroFeatureProps>(
  function HeroFeature({ videoSrc }, ref) {
    return (
      <div className="lp-feature">
        <div className="lp-panel relative aspect-video overflow-hidden">
          {videoSrc ? (
            <video
              className="lp-feature-video h-full w-full object-cover"
              src={videoSrc}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <SynthFrame label="TANITIM KAYDI BEKLENİYOR" />
          )}

          {/* Hafif parazit dokusu */}
          <div className="lp-static pointer-events-none absolute inset-0 opacity-[0.06]" />

          {/* Piksel örtü — reveal HeroSection scroll sekansından tetiklenir */}
          <div
            ref={ref}
            className="pointer-events-none absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${REVEAL_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${REVEAL_ROWS}, 1fr)`,
            }}
            aria-hidden="true"
          >
            {Array.from({ length: REVEAL_COLS * REVEAL_ROWS }, (_, i) => (
              <div
                key={i}
                className="lp-reveal-cell"
                style={{
                  background: isRedCell(i) ? "var(--lp-red)" : "var(--lp-void-deep)",
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="mt-2 flex items-center justify-between text-xs tracking-[0.25em]"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
        >
          <span>MAFILU // TANITIM</span>
          <span style={{ color: "var(--lp-red-dim)" }}>● CANLI YAYIN</span>
        </div>
      </div>
    );
  }
);

export { REVEAL_COLS };
