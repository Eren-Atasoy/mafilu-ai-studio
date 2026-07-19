"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SketchTv, type SketchTvVariant } from "./SketchTv";

interface CrtIntroProps {
  onComplete: () => void;
}

const GRID_SIZE = 5;
const CENTER_INDEX = Math.floor((GRID_SIZE * GRID_SIZE) / 2);

/** Merkez hariç döngüsel cihaz dizilimi — Fun Society arcade duvarı */
const VARIANT_CYCLE: SketchTvVariant[] = ["tv", "arcade", "monitor", "tv", "monitor", "arcade"];

function variantFor(index: number): SketchTvVariant {
  if (index === CENTER_INDEX) return "monitor";
  return VARIANT_CYCLE[index % VARIANT_CYCLE.length];
}

/**
 * Açılış sekansı: el çizimi CRT duvarı → merkez ekrana derin zoom →
 * fosfor flash → reveal. prefers-reduced-motion aktifse sekans atlanır.
 */
export function CrtIntro({ onComplete }: CrtIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Sekans atlanır; state yerine doğrudan gizleme (senkron setState'ten kaçın)
      gsap.set(rootRef.current, { display: "none" });
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.in" },
        onComplete: () => {
          setIsDone(true);
          onComplete();
        },
      });

      tl.from(gridRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power1.out",
      })
        // Kısa bekleme — duvar algılansın
        .to({}, { duration: 0.55 })
        // Merkez ekrana derin zoom; hafif rotasyon sekansa "kamera" hissi verir
        .to(gridRef.current, {
          scale: 17,
          rotation: 1.4,
          duration: 1.7,
          force3D: true,
        })
        // Fosfor flash — ekranın "içine girme" anı
        .to(
          flashRef.current,
          { opacity: 1, duration: 0.18, ease: "power4.in" },
          "-=0.22"
        )
        .to(flashRef.current, { opacity: 0, duration: 0.7, ease: "power2.out" });
    }, rootRef);

    return () => ctx.revert();
    // onComplete referansı sabit (parent useCallback) — sekans tek sefer kurulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: "var(--lp-bg-deep)", perspective: "900px" }}
      aria-hidden="true"
    >
      <div
        ref={gridRef}
        className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: "160vmax",
          height: "160vmax",
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <div key={i} className="relative flex items-center justify-center">
            <SketchTv
              variant={variantFor(i)}
              isLit={i === CENTER_INDEX}
              className={`h-[82%] w-[82%] ${i % 3 === 0 ? "lp-boil" : "lp-boil-slow"}`}
            />
          </div>
        ))}
      </div>

      {/* Analog parazit örtüsü */}
      <div className="lp-static pointer-events-none absolute inset-0 opacity-[0.07]" />

      {/* Fosfor flash */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(circle at center, oklch(0.98 0.06 145) 0%, oklch(0.95 0.03 145) 45%, oklch(0.85 0.25 145 / 0.9) 100%)",
        }}
      />
    </div>
  );
}
