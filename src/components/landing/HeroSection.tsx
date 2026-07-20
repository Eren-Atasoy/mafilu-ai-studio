"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NeonSign } from "./NeonSign";
import { ShowcaseWall } from "./ShowcaseWall";
import { HeroFeature, REVEAL_COLS } from "./HeroFeature";
import { PixelLink, makeWaveDelay } from "./PixelTransition";

gsap.registerPlugin(ScrollTrigger);

const DOCK_SCROLL_START = 140; // px — bu kadar kaydırınca tabela yerleşir
const PIN_DISTANCE = 520; // px — hero bu mesafe boyunca pinli kalır

interface HeroSectionProps {
  showcaseFiles: string[];
}

function firstVideoOf(files: string[]): string | null {
  return files.find((f) => f.endsWith(".mp4") || f.endsWith(".webm")) ?? null;
}

/**
 * Hero sahnesi: tabela ve video karesi AYNI alanı paylaşır. Başta
 * yalnızca bozuk neon MAFILU görünür; aşağı kaydırınca tabela FLIP ile
 * sol üst nav dock'una uçar ve aynı noktada video karesi piksel
 * dalgasıyla belirir. Tepeye dönünce sekans tersine sarar.
 * Reveal animasyonları LandingPage timeline'ında (.lp-hero-item).
 */
export function HeroSection({ showcaseFiles }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLHeadingElement>(null);
  const floatRef = useRef<HTMLSpanElement>(null);
  const featureWrapRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const holder = holderRef.current;
    const float = floatRef.current;
    const featureWrap = featureWrapRef.current;
    const reveal = revealRef.current;
    if (!section || !stage || !holder || !float || !featureWrap || !reveal) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cells = Array.from(reveal.children);
    const video = section.querySelector<HTMLVideoElement>(".lp-feature-video");

    if (prefersReduced) {
      // Yerleşme yok; CSS (.lp-stage-sign media query) tabelayı statik
      // dizer, kare baştan açık görünür
      gsap.set(featureWrap, { autoAlpha: 1 });
      gsap.set(cells, { scale: 0 });
      return;
    }

    gsap.set(featureWrap, { autoAlpha: 0 });
    gsap.set(cells, { scale: 1 });
    const waveDelay = makeWaveDelay(REVEAL_COLS);
    let isDocked = false;

    function dockSign() {
      const navSign = document.getElementById("lp-nav-sign");
      if (isDocked || !navSign || !float || !stage) return;
      isDocked = true;

      const from = float.getBoundingClientRect();
      const to = navSign.getBoundingClientRect();
      const scale = to.height / from.height;

      gsap.killTweensOf([float, featureWrap, cells]);
      // Tabela akıştan çıkıp nav tabelasının konumuna uçar; varınca
      // devir teslim: nav'daki statik tabela görünür olur, uçan kopya
      // gizlenip akışa iade edilir (pin/transform'lardan etkilenmez)
      gsap.set(float, {
        position: "fixed",
        top: from.top,
        left: from.left,
        margin: 0,
        zIndex: 41,
      });
      gsap.to(float, {
        x: to.left - from.left,
        y: to.top - from.top,
        scale,
        transformOrigin: "left top",
        duration: 0.75,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(navSign, { opacity: 1 });
          gsap.set(float, { clearProps: "all" });
          gsap.set(float, { autoAlpha: 0 });
        },
      });

      // Tabelanın bıraktığı yerde kare belirir: önce örtülü yüzey,
      // ardından piksel dalgası açılır → video başlar
      gsap.to(featureWrap, { autoAlpha: 1, duration: 0.25, delay: 0.2 });
      gsap.to(cells, {
        scale: 0,
        duration: 0.32,
        ease: "power2.out",
        stagger: waveDelay,
        delay: 0.4,
        onComplete: () => {
          video?.play().catch(() => {
            /* autoplay engellenirse poster karesi kalır */
          });
        },
      });
    }

    function undockSign() {
      const navSign = document.getElementById("lp-nav-sign");
      if (!isDocked || !navSign || !float) return;
      isDocked = false;

      gsap.killTweensOf([float, featureWrap, cells]);
      video?.pause();
      // Kare piksel dalgasıyla kapanıp kaybolur (çıkış girişten hızlı)
      gsap.to(cells, { scale: 1, duration: 0.2, ease: "power2.in", stagger: waveDelay });
      gsap.to(featureWrap, { autoAlpha: 0, duration: 0.2, delay: 0.3 });

      // Devir teslim tersine: nav tabelası gizlenir, uçan kopya nav
      // konumundan sahnedeki doğal yerine geri uçar
      gsap.set(float, { clearProps: "all" });
      const natural = float.getBoundingClientRect();
      const from = navSign.getBoundingClientRect();
      const scale = from.height / natural.height;
      gsap.set(navSign, { opacity: 0 });
      gsap.set(float, {
        position: "fixed",
        top: natural.top,
        left: natural.left,
        margin: 0,
        zIndex: 41,
        x: from.left - natural.left,
        y: from.top - natural.top,
        scale,
        transformOrigin: "left top",
      });
      gsap.to(float, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(float, { clearProps: "all" });
        },
      });
    }

    // Hero, dock sekansı boyunca pinlenir: kullanıcı kaydırdıkça sayfa
    // sabit kalır, tabela uçar ve kare açılır; sekans bitince akış sürer
    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN_DISTANCE}`,
      pin: true,
    });
    // Histerezis: dock 140px'te tetiklenir, undock ancak tepeye dönünce.
    // Mutlak scroll konumu kullanılır — pin, eleman bazlı ölçümü bozar
    const dockTrigger = ScrollTrigger.create({
      start: DOCK_SCROLL_START,
      end: Number.MAX_SAFE_INTEGER,
      onEnter: dockSign,
    });
    const undockTrigger = ScrollTrigger.create({
      start: 10,
      end: Number.MAX_SAFE_INTEGER,
      onLeaveBack: undockSign,
    });

    return () => {
      pinTrigger.kill();
      dockTrigger.kill();
      undockTrigger.kill();
      gsap.killTweensOf([float, featureWrap, cells]);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative flex min-h-svh flex-col justify-center gap-10 pt-24 pb-10"
    >
      <div className="flex flex-col items-center px-5 text-center">
        {/* Sahne: tabela ve kare aynı alanı paylaşır */}
        <div ref={stageRef} className="lp-hero-item relative mx-auto w-full max-w-4xl opacity-0">
          <div ref={featureWrapRef} className="lp-feature-wrap">
            <HeroFeature ref={revealRef} videoSrc={firstVideoOf(showcaseFiles)} />
          </div>
          <h1
            ref={holderRef}
            id="hero-heading"
            className="lp-stage-sign text-[clamp(2.75rem,10.5vw,8rem)] leading-none tracking-[0.02em]"
          >
            <span ref={floatRef} className="inline-block will-change-transform">
              <NeonSign />
            </span>
          </h1>
        </div>

        <p
          className="lp-hero-item mt-7 text-lg tracking-[0.2em] opacity-0 sm:text-xl"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
        >
          &gt; YAPAY ZEKÂ DESTEKLİ İÇERİK STÜDYOSU
          <span className="lp-cursor ml-2" />
        </p>

        <div className="lp-hero-item mt-8 flex flex-wrap items-center justify-center gap-4 opacity-0">
          <PixelLink href="/kayit" className="lp-btn lp-btn--solid">
            ÜRETMEYE BAŞLA
          </PixelLink>
          <a href="#pipeline" className="lp-btn">
            NASIL ÇALIŞIR?
          </a>
        </div>
      </div>

      {/* Arşiv film şeridi */}
      <div className="lp-hero-item opacity-0">
        <ShowcaseWall files={showcaseFiles} />
      </div>
    </section>
  );
}
