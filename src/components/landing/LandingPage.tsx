"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { CrtIntro } from "./CrtIntro";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { PipelineSection } from "./PipelineSection";
import { MegaFooter } from "./MegaFooter";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing kökü: Lenis smooth scroll + GSAP entegrasyonu, CRT intro
 * sekansı ve intro sonrası nav/hero reveal timeline'ı.
 */
export function LandingPage() {
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
      tl.to(".lp-nav", { opacity: 1, duration: 0.6 })
        .to(
          ".lp-hero-word",
          { y: 0, duration: 0.75, stagger: 0.08, ease: "power4.out" },
          "-=0.3"
        )
        .to(".lp-hero-sub", { opacity: 1, duration: 0.7, stagger: 0.12 }, "-=0.35");
    }, rootRef);
    // Timeline tek seferlik; context revert'e gerek yok (sayfa ömrü boyunca kalır)
    void ctx;
  }, []);

  return (
    <div ref={rootRef} className="landing relative min-h-svh">
      <div className="lp-paper-texture" />
      <div className="lp-scanlines" />

      <CrtIntro onComplete={handleIntroComplete} />

      <LandingNav />
      <main className="relative z-10">
        <HeroSection />
        <PipelineSection />
      </main>
      <MegaFooter />
    </div>
  );
}
