"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";
import { SynthFrame } from "./SynthFrame";

gsap.registerPlugin(ScrollTrigger);

const TYPED_PROMPT = "> gece yarısı neon şehirde retro bir kovalamaca, VHS estetiği...";

/**
 * Ürün hattı: 3 scroll sahnesi — AI üretim (typewriter + render reveal),
 * kurgu masası (edit deck timeline), yayın (verici + sosyal ikonlar).
 */
export function PipelineSection() {
  const rootRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        // Animasyonsuz: her şey görünür durumda bırakılır
        gsap.set(".lp-scene-item", { opacity: 1, y: 0 });
        gsap.set(".lp-color-reveal", { clipPath: "inset(0% 0% 0% 0%)" });
        if (typedRef.current) typedRef.current.textContent = TYPED_PROMPT;
        return;
      }

      // Sahne içerikleri: girişte aşağıdan belirme
      gsap.utils.toArray<HTMLElement>(".lp-scene").forEach((scene) => {
        gsap.from(scene.querySelectorAll(".lp-scene-item"), {
          y: 48,
          opacity: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: "power2.out",
          scrollTrigger: { trigger: scene, start: "top 62%" },
        });
      });

      // Sahne 1 — typewriter
      const typeState = { count: 0 };
      gsap.to(typeState, {
        count: TYPED_PROMPT.length,
        duration: 2.4,
        ease: "none",
        snap: { count: 1 },
        scrollTrigger: { trigger: "#scene-generate", start: "top 55%" },
        onUpdate: () => {
          if (typedRef.current) {
            typedRef.current.textContent = TYPED_PROMPT.slice(0, typeState.count);
          }
        },
      });

      // Sahne 1 — parazitten render'a geçiş (scrub, soldan sağa)
      gsap.fromTo(
        ".lp-color-reveal",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: "#scene-generate",
            start: "top 45%",
            end: "bottom 65%",
            scrub: 0.6,
          },
        }
      );

      // Sahne 2 — timeline kliplerinin kayarak girişi
      gsap.from(".lp-clip", {
        xPercent: -120,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "#scene-edit", start: "top 50%" },
      });

      // Sahne 3 — radyo dalgaları + yüzen sosyal ikonlar
      gsap.fromTo(
        ".lp-wave",
        { strokeDashoffset: 120, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 0.9,
          stagger: 0.25,
          duration: 1.1,
          ease: "power1.out",
          repeat: -1,
          repeatDelay: 0.6,
          scrollTrigger: { trigger: "#scene-publish", start: "top 55%" },
        }
      );
      gsap.from(".lp-social", {
        y: 60,
        opacity: 0,
        stagger: 0.18,
        duration: 0.9,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: "#scene-publish", start: "top 45%" },
      });
      // Yüzme, giriş animasyonuyla çakışmasın diye iç sarmalayıcıda
      gsap.to(".lp-social-float", {
        y: -10,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.4, from: "random" },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="pipeline" aria-label="Ürün akışı" className="relative z-10">
      <SceneGenerate typedRef={typedRef} />
      <SceneEdit />
      <ScenePublish />
    </section>
  );
}

function SceneHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="lp-scene-item mb-10">
      <span
        className="text-lg tracking-[0.3em]"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-red)" }}
      >
        {step}
      </span>
      <h2
        className="mt-2 text-[clamp(2rem,5vw,3.5rem)] leading-tight uppercase"
        style={{ fontFamily: "var(--lp-font-display)", color: "var(--lp-ink)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function SceneGenerate({ typedRef }: { typedRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div id="scene-generate" className="lp-scene mx-auto max-w-6xl px-5 py-28">
      <SceneHeading step="ADIM 01" title="Yaz, üretsin" />
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Terminal */}
        <div className="lp-scene-item">
          <div className="lp-panel p-5">
            <div
              className="mb-3 flex items-center justify-between border-b pb-2 text-sm tracking-[0.2em]"
              style={{ borderColor: "var(--lp-line)", fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
            >
              <span>MAFILU_TERMINAL</span>
              <span style={{ color: "var(--lp-red)" }}>● CANLI</span>
            </div>
            <div
              className="min-h-24 text-xl leading-relaxed"
              style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink)" }}
            >
              <span ref={typedRef} />
              <span className="lp-cursor" />
            </div>
          </div>
          <p className="mt-5 max-w-md text-base" style={{ color: "var(--lp-ink-dim)" }}>
            Türkçe yaz; Mafilu komutu sinematik prompt&apos;a çevirir, görseli üretir.
          </p>
        </div>

        {/* Parazit → render reveal */}
        <div className="lp-scene-item lp-panel relative aspect-[4/3] overflow-hidden">
          {/* Alt katman: sinyal yok, statik parazit */}
          <div className="lp-static absolute inset-0 opacity-40" />
          <span
            className="absolute top-3 left-4 text-sm tracking-[0.25em]"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            SİNYAL YOK
          </span>
          {/* Üst katman: render'lanan synthwave karesi (scrub ile açılır) */}
          <div className="lp-color-reveal absolute inset-0">
            <SynthFrame />
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneEdit() {
  const clipWidths = ["28%", "18%", "34%", "14%"];
  return (
    <div id="scene-edit" className="lp-scene mx-auto max-w-6xl px-5 py-28">
      <SceneHeading step="ADIM 02" title="Karanlık odada kurgula" />
      <div className="lp-scene-item lp-panel p-6 md:p-8">
        {/* Edit deck üst paneli */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="text-lg tracking-[0.2em]"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            MAFILU EDIT DECK v2.0
          </span>
          <span className="flex gap-2">
            {["REC", "PLAY", "FF"].map((label) => (
              <span
                key={label}
                className="lp-btn px-3 py-1 text-xs"
                style={{ color: label === "REC" ? "var(--lp-red)" : undefined }}
              >
                {label}
              </span>
            ))}
          </span>
        </div>
        {/* Timeline izleri */}
        {[0, 1, 2].map((track) => (
          <div
            key={track}
            className="mb-3 flex h-12 items-center gap-2 border-b px-2"
            style={{ borderColor: "var(--lp-line)" }}
          >
            <span
              className="w-14 shrink-0 text-sm"
              style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
            >
              {track === 2 ? "SES" : `VID ${track + 1}`}
            </span>
            {clipWidths.slice(0, 3 - (track % 2)).map((width, i) => (
              <div
                key={i}
                className="lp-clip h-8 rounded-[2px] border transition-shadow duration-200 hover:shadow-[0_0_14px_oklch(0.63_0.26_19/0.5)]"
                style={{
                  width,
                  borderColor: track === 2 ? "oklch(0.4 0.055 250 / 0.8)" : "var(--lp-red-dim)",
                  background:
                    track === 2
                      ? "repeating-linear-gradient(90deg, oklch(0.4 0.055 250 / 0.4) 0 4px, transparent 4px 8px)"
                      : "oklch(0.63 0.26 19 / 0.12)",
                }}
              />
            ))}
          </div>
        ))}
        <p className="mt-4 text-base" style={{ color: "var(--lp-ink-dim)" }}>
          Remotion tabanlı kurgu — kes, sırala, altyazı ekle, tek tıkla render al.
        </p>
      </div>
    </div>
  );
}

function ScenePublish() {
  const socials = [
    { Icon: InstagramLogo, label: "Instagram" },
    { Icon: TiktokLogo, label: "TikTok" },
    { Icon: YoutubeLogo, label: "YouTube" },
  ];
  return (
    <div id="scene-publish" className="lp-scene mx-auto max-w-6xl px-5 py-28">
      <SceneHeading step="ADIM 03" title="Sinyali yayınla" />
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="lp-scene-item relative flex justify-center">
          <BroadcastMast className="h-72 w-auto md:h-96" />
        </div>
        <div className="lp-scene-item flex flex-col items-center gap-8">
          <div className="flex gap-6">
            {socials.map(({ Icon, label }) => (
              <div key={label} className="lp-social">
                <div className="lp-social-float lp-panel--navy lp-panel flex flex-col items-center gap-2 p-5">
                  <Icon size={40} color="var(--lp-red)" weight="duotone" aria-hidden />
                  <span
                    className="text-sm tracking-[0.15em]"
                    style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="max-w-md text-center text-base" style={{ color: "var(--lp-ink-dim)" }}>
            Render biter bitmez videon zamanlanmış paylaşımlarla hesaplarına ışınlanır.
            Sen bir sonraki fikre geç.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Geometrik verici direği + yayılan dalgalar (çizimsiz, düz hatlar) */
function BroadcastMast({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 300" className={className} fill="none" aria-hidden="true">
      {/* Direk */}
      <line x1="110" y1="60" x2="110" y2="280" stroke="var(--lp-line)" strokeWidth="3" />
      <line x1="80" y1="280" x2="110" y2="180" stroke="var(--lp-line)" strokeWidth="1.5" />
      <line x1="140" y1="280" x2="110" y2="180" stroke="var(--lp-line)" strokeWidth="1.5" />
      <line x1="70" y1="282" x2="150" y2="282" stroke="var(--lp-line)" strokeWidth="3" />
      {/* Tepe ışığı */}
      <circle cx="110" cy="54" r="5" fill="var(--lp-red)" />
      {/* Radyo dalgaları */}
      {[26, 44, 62].map((r, i) => (
        <path
          key={i}
          className="lp-wave"
          d={`M ${110 - r} ${52 - r * 0.4} A ${r} ${r} 0 0 1 ${110 + r} ${52 - r * 0.4}`}
          stroke="var(--lp-red)"
          strokeWidth="2"
          strokeDasharray="120"
          strokeDashoffset="120"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
