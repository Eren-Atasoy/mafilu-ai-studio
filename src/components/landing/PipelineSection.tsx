"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const TYPED_PROMPT = "> gün batımında retro bir şehir, VHS estetiği, 80'ler neon...";

/**
 * Ürün hattı: 3 scroll sahnesi — AI üretim (typewriter + renklenme),
 * editör (VHS konsol timeline), otomasyon (verici kulesi → sosyal ikonlar).
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

      // Sahne içerikleri: girişte aşağıdan + blur'dan belirme
      gsap.utils.toArray<HTMLElement>(".lp-scene").forEach((scene) => {
        gsap.from(scene.querySelectorAll(".lp-scene-item"), {
          y: 48,
          opacity: 0,
          filter: "blur(6px)",
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

      // Sahne 1 — siyah-beyaz sketch'in renklenmesi (scrub)
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
        rotation: -8,
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
        className="text-xl tracking-[0.3em]"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-amber)" }}
      >
        {step}
      </span>
      <h2
        className="lp-glow-phosphor mt-2 text-[clamp(2rem,5vw,3.75rem)] leading-tight"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink)" }}
      >
        {title}
      </h2>
    </div>
  );
}

function SceneGenerate({ typedRef }: { typedRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div id="scene-generate" className="lp-scene mx-auto max-w-6xl px-5 py-28">
      <SceneHeading step="ADIM 01" title="YAZ, ÜRETSİN" />
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Terminal + klavye */}
        <div className="lp-scene-item">
          <div className="lp-sketch-frame p-5">
            <div
              className="min-h-24 text-xl leading-relaxed"
              style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-phosphor)" }}
            >
              <span ref={typedRef} />
              <span className="lp-cursor" />
            </div>
          </div>
          <SketchKeyboard className="lp-boil-slow mt-6 h-auto w-full max-w-md" />
        </div>

        {/* Sketch → renkli sahne */}
        <div className="lp-scene-item relative aspect-[4/3]">
          <SketchScene className="lp-boil absolute inset-0 h-full w-full" colored={false} />
          <div className="lp-color-reveal absolute inset-0">
            <SketchScene className="lp-boil absolute inset-0 h-full w-full" colored />
          </div>
          <p
            className="absolute -bottom-8 right-2 text-2xl"
            style={{ fontFamily: "var(--lp-font-sketch)", color: "var(--lp-amber)" }}
          >
            karakalemden sahneye →
          </p>
        </div>
      </div>
    </div>
  );
}

function SceneEdit() {
  const clipWidths = ["28%", "18%", "34%", "14%"];
  return (
    <div id="scene-edit" className="lp-scene mx-auto max-w-6xl px-5 py-28">
      <SceneHeading step="ADIM 02" title="ANALOG MASADA KURGULA" />
      <div className="lp-scene-item lp-sketch-frame p-6 md:p-8">
        {/* VHS konsol üst paneli */}
        <div className="mb-6 flex items-center justify-between">
          <span
            className="text-lg tracking-[0.2em]"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            MAFILU-VHS EDIT DECK v1.0
          </span>
          <span className="flex gap-2">
            {["REC", "PLAY", "FF"].map((label) => (
              <span
                key={label}
                className="lp-btn px-3 py-1 text-sm"
                style={{ color: label === "REC" ? "var(--lp-amber)" : undefined }}
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
            className="mb-3 flex h-12 items-center gap-2 border-b border-dashed px-2"
            style={{ borderColor: "var(--lp-pencil)" }}
          >
            <span
              className="w-14 shrink-0 text-sm"
              style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-pencil)" }}
            >
              {track === 2 ? "SES" : `VID ${track + 1}`}
            </span>
            {clipWidths.slice(0, 3 - (track % 2)).map((width, i) => (
              <div
                key={i}
                className="lp-clip h-8 rounded-sm border transition-shadow duration-200 hover:shadow-[0_0_14px_oklch(0.85_0.25_145/0.5)]"
                style={{
                  width,
                  borderColor: "var(--lp-phosphor-dim)",
                  background:
                    track === 2
                      ? "repeating-linear-gradient(90deg, oklch(0.8 0.16 75 / 0.25) 0 4px, transparent 4px 8px)"
                      : "oklch(0.85 0.25 145 / 0.12)",
                }}
              />
            ))}
          </div>
        ))}
        <p
          className="mt-4 text-lg"
          style={{ fontFamily: "var(--lp-font-sketch)", color: "var(--lp-ink-dim)" }}
        >
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
      <SceneHeading step="ADIM 03" title="SİNYALİ YAYINLA" />
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="lp-scene-item relative flex justify-center">
          <SketchTower className="lp-boil-slow h-72 w-auto md:h-96" />
        </div>
        <div className="lp-scene-item flex flex-col items-center gap-8">
          <div className="flex gap-8">
            {socials.map(({ Icon, label }) => (
              <div key={label} className="lp-social">
                <div className="lp-social-float lp-sketch-frame flex flex-col items-center gap-2 p-5">
                  <Icon size={44} color="var(--lp-phosphor)" weight="duotone" aria-hidden />
                  <span
                    className="text-base"
                    style={{ fontFamily: "var(--lp-font-sketch)", color: "var(--lp-ink-dim)" }}
                  >
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="max-w-md text-center text-lg" style={{ color: "var(--lp-ink-dim)" }}>
            Render biter bitmez videon zamanlanmış paylaşımlarla hesaplarına ışınlanır.
            Sen bir sonraki fikre geç.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Placeholder sketch SVG'leri ---------- */

function SketchKeyboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 110" className={className} fill="none" aria-hidden="true">
      <rect x="6" y="10" width="308" height="90" rx="10" stroke="var(--lp-ink)" strokeWidth="2.2" />
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 10 - row }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={20 + col * 28 + row * 12}
            y={22 + row * 22}
            width="22"
            height="16"
            rx="3"
            stroke="var(--lp-pencil)"
            strokeWidth="1.5"
          />
        ))
      )}
      <rect x="92" y="88" width="130" height="8" rx="3" stroke="var(--lp-pencil)" strokeWidth="1.5" />
    </svg>
  );
}

function SketchScene({ className, colored }: { className?: string; colored: boolean }) {
  const line = colored ? "var(--lp-amber)" : "var(--lp-pencil)";
  const sun = colored ? "var(--lp-amber)" : "none";
  const grid = colored ? "var(--lp-phosphor)" : "var(--lp-pencil)";
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden="true">
      <rect
        x="4" y="4" width="392" height="292" rx="8"
        stroke="var(--lp-ink)" strokeWidth="2.4"
        fill={colored ? "oklch(0.2 0.03 300)" : "var(--lp-paper)"}
      />
      {/* Retro güneş */}
      <circle cx="200" cy="140" r="56" stroke={line} strokeWidth="2.4" fill={sun} fillOpacity={colored ? 0.25 : 0} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="144" y1={110 + i * 22} x2="256" y2={110 + i * 22} stroke={colored ? "oklch(0.2 0.03 300)" : "var(--lp-paper)"} strokeWidth="6" />
      ))}
      {/* Şehir silueti */}
      <path d="M20 240 L60 240 L60 190 L95 190 L95 240 L140 240 L140 170 L175 170 L175 240 L230 240 L230 200 L265 200 L265 240 L310 240 L310 180 L345 180 L345 240 L380 240" stroke={line} strokeWidth="2.2" />
      {/* Perspektif grid zemini */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={20 + i * 90} y1="296" x2="200" y2="240" stroke={grid} strokeWidth="1.2" opacity="0.6" />
      ))}
      <line x1="20" y1="268" x2="380" y2="268" stroke={grid} strokeWidth="1.2" opacity="0.6" />
      <line x1="20" y1="284" x2="380" y2="284" stroke={grid} strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

function SketchTower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 300" className={className} fill="none" aria-hidden="true">
      {/* Kule gövdesi */}
      <path d="M95 280 L110 60 L125 280" stroke="var(--lp-ink)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M98 240 L122 240 M100 200 L120 200 M102 160 L118 160 M104 120 L116 120 M106 90 L114 90" stroke="var(--lp-pencil)" strokeWidth="1.8" />
      <path d="M95 280 L122 200 M125 280 L98 200 M98 200 L120 130 M120 200 L100 130" stroke="var(--lp-pencil)" strokeWidth="1.4" />
      {/* Tepe ışığı */}
      <circle cx="110" cy="52" r="5" fill="var(--lp-amber)" />
      {/* Radyo dalgaları */}
      {[26, 44, 62].map((r, i) => (
        <path
          key={i}
          className="lp-wave"
          d={`M ${110 - r} ${52 - r * 0.4} A ${r} ${r} 0 0 1 ${110 + r} ${52 - r * 0.4}`}
          stroke="var(--lp-phosphor)"
          strokeWidth="2"
          strokeDasharray="120"
          strokeDashoffset="120"
          strokeLinecap="round"
        />
      ))}
      {/* Zemin */}
      <line x1="60" y1="282" x2="160" y2="282" stroke="var(--lp-ink)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
