"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { NeonSign } from "./NeonSign";

interface NeonIntroProps {
  onComplete: () => void;
}

/**
 * Açılış: zift karanlıkta MAFILU tabelası transformatör cızırtısıyla
 * birkaç denemede yanar, sabitlenir, overlay yukarı sıyrılır.
 * Tıkla-atla destekli; prefers-reduced-motion'da sekans atlanır.
 */
export function NeonIntro({ onComplete }: NeonIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(rootRef.current, { display: "none" });
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsDone(true);
          onComplete();
        },
      });
      tlRef.current = tl;

      // Ateşleme denemeleri — düzensiz burst'ler, steps hissi için kısa süreler
      tl.set(signRef.current, { opacity: 0 })
        .to(signRef.current, { opacity: 1, duration: 0.05 }, 0.35)
        .to(signRef.current, { opacity: 0.15, duration: 0.05 })
        .to(signRef.current, { opacity: 0.9, duration: 0.04 })
        .to(signRef.current, { opacity: 0, duration: 0.07 })
        .to({}, { duration: 0.22 })
        .to(signRef.current, { opacity: 1, duration: 0.04 })
        .to(signRef.current, { opacity: 0.25, duration: 0.06 })
        .to(signRef.current, { opacity: 1, duration: 0.05 })
        // Sabitlendi — tabela algılansın
        .to({}, { duration: 0.55 })
        // Overlay yukarı sıyrılır; tabela hero'daki yerine devrolur
        .to(rootRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: "power3.inOut",
        });
    }, rootRef);

    return () => ctx.revert();
    // onComplete referansı sabit (parent useCallback) — sekans tek sefer kurulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSkip() {
    tlRef.current?.progress(1);
  }

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--lp-void-deep)" }}
      aria-hidden="true"
    >
      <div
        ref={signRef}
        className="text-[clamp(2.75rem,11vw,9rem)] leading-none tracking-[0.02em]"
        style={{ willChange: "opacity" }}
      >
        <NeonSign variant="static" />
      </div>

      {/* Analog parazit örtüsü */}
      <div className="lp-static pointer-events-none absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
