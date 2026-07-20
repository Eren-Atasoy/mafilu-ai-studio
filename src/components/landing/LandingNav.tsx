"use client";

import { NeonSign } from "./NeonSign";
import { PixelLink } from "./PixelTransition";

/**
 * Kromsuz yüzen nav: çizgi/bar yok. Sol taraf boş — orası scroll'da
 * hero tabelasının yerleşeceği dock hedefi (#lp-sign-dock).
 * Görünürlük animasyonu LandingPage'deki GSAP timeline'dan gelir (.lp-nav).
 */
export function LandingNav() {
  return (
    <header className="lp-nav fixed inset-x-0 top-0 z-40 opacity-0">
      <nav
        aria-label="Ana gezinme"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"
      >
        {/* Nav tabelası: hero'daki tabela uçuşunu bitirince görünür olur
            (devir teslim) — uçuş hedefi bu elemanın rect'idir */}
        <span
          id="lp-nav-sign"
          className="pointer-events-none text-xl tracking-[0.06em] opacity-0"
          aria-hidden="true"
        >
          <NeonSign variant="static" />
        </span>

        <div className="flex items-center gap-6">
          <PixelLink href="/giris" className="lp-nav-link">
            <span className="lp-nav-bracket" aria-hidden="true">[</span>
            GİRİŞ
            <span className="lp-nav-bracket" aria-hidden="true">]</span>
          </PixelLink>

          <PixelLink href="/kayit" className="lp-rec-btn">
            <span className="lp-rec-dot" aria-hidden="true" />
            KAYIT OL
          </PixelLink>
        </div>
      </nav>
    </header>
  );
}
