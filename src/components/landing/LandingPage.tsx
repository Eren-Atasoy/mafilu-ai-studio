"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { NeonIntro } from "./NeonIntro";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { PipelineSection } from "./PipelineSection";
import { MegaFooter } from "./MegaFooter";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  showcaseFiles: string[];
}

/**
 * Landing kökü: Lenis smooth scroll + GSAP entegrasyonu, neon tabela
 * introsu ve intro sonrası nav/hero reveal timeline'ı.
 */
export function LandingPage({ showcaseFiles }: LandingPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Lenis — yalnızca landing yaşam döngüsünde, ScrollTrigger ile senkron
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({ duration: 1.15 });
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Intro bitince: nav + hero reveal
  const handleIntroComplete = useCallback(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".lp-nav", { opacity: 1, duration: 0.6 }).fromTo(
        ".lp-hero-item",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          // Transform temizlenmeli: transform'lu ata, içindeki position:fixed
          // tabelanın (dock uçuşu) viewport referansını bozar
          onComplete: () => gsap.set(".lp-hero-item", { clearProps: "transform" }),
        },
        "-=0.35"
      );
    }, rootRef);
    // Timeline tek seferlik; context revert'e gerek yok (sayfa ömrü boyunca kalır)
    void ctx;
  }, []);

  return (
    <div ref={rootRef} className="landing relative min-h-svh">
      <div className="lp-scanlines" />

      <NeonIntro onComplete={handleIntroComplete} />

      <LandingNav />
      <main className="relative z-10">
        <HeroSection showcaseFiles={showcaseFiles} />
        <PipelineSection />
      </main>
      <MegaFooter />
    </div>
  );
}
