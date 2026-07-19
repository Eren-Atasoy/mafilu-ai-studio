"use client";

import Link from "next/link";

/**
 * Flash sonrası beliren minimal nav — CRT terminal estetiği.
 * Görünürlük animasyonu LandingPage'deki GSAP timeline'dan gelir (.lp-nav).
 */
export function LandingNav() {
  return (
    <header className="lp-nav fixed inset-x-0 top-0 z-40 opacity-0">
      <nav
        aria-label="Ana gezinme"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
      >
        <Link
          href="/"
          className="lp-glow-phosphor text-2xl tracking-wider"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-phosphor)" }}
        >
          MAFILU_
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/giris" className="lp-btn text-base">
            GİRİŞ
          </Link>
          <Link href="/kayit" className="lp-btn lp-btn--solid text-base">
            KAYIT OL
          </Link>
        </div>
      </nav>
    </header>
  );
}
