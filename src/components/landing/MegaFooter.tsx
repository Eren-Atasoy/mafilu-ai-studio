"use client";

import { PixelLink } from "./PixelTransition";

/**
 * Dev tipografili kapanış — Anton display, neon kırmızı vurgu.
 */
export function MegaFooter() {
  return (
    <footer className="relative z-10 overflow-hidden px-5 pt-28 pb-10">
      <div className="mx-auto max-w-6xl">
        <p
          className="lp-scene-item mb-3 text-base tracking-[0.3em]"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-red)" }}
        >
          &gt; SON_KAYIT.LOG
        </p>
        <h2
          className="text-[clamp(2.1rem,7vw,5.5rem)] leading-[1.05] uppercase"
          style={{ fontFamily: "var(--lp-font-display)", color: "var(--lp-ink)" }}
        >
          Birlikte harika
          <br />
          işler <span style={{ color: "var(--lp-red)" }}>çıkaralım</span>
        </h2>

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t pt-8"
          style={{ borderColor: "var(--lp-line)" }}
        >
          <PixelLink href="/kayit" className="lp-btn lp-btn--solid">
            ÜCRETSİZ BAŞLA
          </PixelLink>
          <div
            className="text-base"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            <a href="mailto:iletisim@mafilu.ai" className="hover:text-[var(--lp-red-hot)]">
              iletisim@mafilu.ai
            </a>
            <span className="mx-3">•</span>
            <span>© {new Date().getFullYear()} MAFILU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
