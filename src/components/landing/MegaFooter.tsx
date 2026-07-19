"use client";

/**
 * Dev tipografili kapanış — Stitch showcase footer'ından ilham,
 * sketchpunk diline çevrilmiş hali.
 */
export function MegaFooter() {
  return (
    <footer className="relative z-10 overflow-hidden px-5 pt-28 pb-10">
      <div className="mx-auto max-w-6xl">
        <p
          className="lp-scene-item mb-2 text-2xl"
          style={{ fontFamily: "var(--lp-font-sketch)", color: "var(--lp-amber)" }}
        >
          bir sonraki sahnen seni bekliyor
        </p>
        <h2
          className="lp-glow-phosphor -rotate-2 text-[clamp(2.6rem,9vw,7rem)] leading-[0.95]"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink)" }}
        >
          BİRLİKTE HARİKA
          <br />
          İŞLER ÇIKARALIM!
        </h2>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-dashed pt-8" style={{ borderColor: "var(--lp-pencil)" }}>
          <a href="/kayit" className="lp-btn lp-btn--solid">
            ÜCRETSİZ BAŞLA
          </a>
          <div
            className="text-base"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            <a href="mailto:iletisim@mafilu.ai" className="hover:text-[var(--lp-phosphor)]">
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
