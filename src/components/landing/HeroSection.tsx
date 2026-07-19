"use client";

import { SketchTv } from "./SketchTv";

const HERO_WORDS = ["ÇİZ,", "KOMUT", "VER,", "SİNEMATİK", "EVRENİNİ", "YARAT"];

/**
 * Intro flash'ının ardından beliren hero — kelime bazlı stagger reveal
 * (animasyon LandingPage GSAP timeline'ında: .lp-hero-word).
 */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-svh flex-col items-center justify-center px-5 pt-24 pb-16 text-center"
    >
      {/* Arka plan: soluk dev monitör çizimi */}
      <SketchTv
        variant="monitor"
        isLit
        className="lp-boil-slow pointer-events-none absolute top-1/2 left-1/2 h-[130%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
      />

      <p
        className="lp-hero-sub mb-4 text-2xl opacity-0 sm:text-3xl"
        style={{ fontFamily: "var(--lp-font-sketch)", color: "var(--lp-amber)" }}
      >
        yapay zekâ destekli içerik stüdyosu
      </p>

      <h1
        id="hero-heading"
        className="lp-glow-phosphor mx-auto max-w-5xl text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] tracking-wide"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink)" }}
      >
        {HERO_WORDS.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <span className="lp-hero-word inline-block translate-y-full pr-[0.28em]">
              {word}
            </span>
          </span>
        ))}
      </h1>

      <p
        className="lp-hero-sub mx-auto mt-8 max-w-xl text-lg opacity-0"
        style={{ color: "var(--lp-ink-dim)" }}
      >
        Mafilu; görsel üretiminden video kurguya ve sosyal medya paylaşımına,
        tüm içerik hattını tek karede birleştirir.
      </p>

      <div className="lp-hero-sub mt-10 flex flex-wrap items-center justify-center gap-4 opacity-0">
        <a href="/kayit" className="lp-btn lp-btn--solid">
          ÜRETMEYE BAŞLA
        </a>
        <a href="#pipeline" className="lp-btn">
          NASIL ÇALIŞIR?
        </a>
      </div>

      {/* Scroll ipucu */}
      <div
        className="lp-hero-sub absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tracking-[0.3em] opacity-0"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-phosphor-dim)" }}
      >
        ▼ KAYDIR
      </div>
    </section>
  );
}
