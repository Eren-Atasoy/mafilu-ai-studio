"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PlaceholderPoster } from "./PlaceholderPoster";

const PLACEHOLDER_COUNT = 8;
/** Kart varyasyonları — boy/ofset/rotasyon döngüsü (tekdüzelik kırılır) */
const CARD_VARIANTS = [
  { width: "13rem", y: -16, rotate: -1.6 },
  { width: "17rem", y: 22, rotate: 0.9 },
  { width: "12rem", y: 6, rotate: 1.8 },
  { width: "15rem", y: -24, rotate: -0.7 },
  { width: "14rem", y: 14, rotate: 1.2 },
  { width: "18rem", y: -8, rotate: -1.9 },
];
const DRIFT_SPEED = 0.35; // px/frame — boştayken kendiliğinden akış
const MAX_SKEW = 5; // hız bazlı eğilme sınırı (deg)

interface ShowcaseWallProps {
  /** /showcase/... yolları; boşsa placeholder kartlar çıkar */
  files: string[];
}

function isVideoFile(file: string): boolean {
  return file.endsWith(".mp4") || file.endsWith(".webm");
}

/**
 * Arşiv film şeridi: sürüklenebilir + momentumlu sonsuz galeri.
 * Sürükleme hızı şeridi eğer (skew), bırakınca atalet devam eder,
 * boşta yavaşça kendiliğinden akar. Reduced-motion: drift ve skew yok.
 */
export function ShowcaseWall({ files }: ShowcaseWallProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Tek setin genişliği (içerik iki kez dizili — sonsuz sarma)
    const halfWidth = track.scrollWidth / 2;
    const wrapX = gsap.utils.wrap(-halfWidth, 0);

    const state = {
      x: 0,
      velocity: 0,
      isDragging: false,
      pointerStart: 0,
      xStart: 0,
      lastPointer: 0,
    };

    const setX = gsap.quickSetter(track, "x", "px");
    const setSkew = gsap.quickSetter(track, "skewX", "deg");

    const tick = () => {
      if (state.isDragging) {
        // skew sürükleme hızından
      } else if (Math.abs(state.velocity) > 0.1) {
        state.x += state.velocity;
        state.velocity *= 0.94; // sürtünme
      } else if (!prefersReduced) {
        state.x -= DRIFT_SPEED;
        state.velocity = 0;
      }
      setX(wrapX(state.x));
      if (!prefersReduced) {
        setSkew(gsap.utils.clamp(-MAX_SKEW, MAX_SKEW, state.velocity * 0.22));
      }
    };
    gsap.ticker.add(tick);

    function onPointerDown(event: PointerEvent) {
      state.isDragging = true;
      state.pointerStart = event.clientX;
      state.lastPointer = event.clientX;
      state.xStart = state.x;
      state.velocity = 0;
      viewport?.setPointerCapture(event.pointerId);
      viewport?.classList.add("lp-strip--grabbing");
    }

    function onPointerMove(event: PointerEvent) {
      if (!state.isDragging) return;
      state.x = state.xStart + (event.clientX - state.pointerStart);
      state.velocity = event.clientX - state.lastPointer;
      state.lastPointer = event.clientX;
    }

    function endDrag() {
      state.isDragging = false;
      viewport?.classList.remove("lp-strip--grabbing");
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    // Viewport dışındaki videolar durur
    const videos = Array.from(track.querySelectorAll("video"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay engellenirse poster karesi kalır */
            });
          } else {
            video.pause();
          }
        }
      },
      { root: viewport, rootMargin: "160px" }
    );
    videos.forEach((video) => observer.observe(video));

    return () => {
      gsap.ticker.remove(tick);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      observer.disconnect();
    };
  }, [files]);

  const items =
    files.length > 0
      ? files
      : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => `ph-${i}`);

  function renderCard(item: string, index: number, keyPrefix: string) {
    const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];
    const label = `KAYIT_${String((index % 99) + 1).padStart(3, "0")}`;

    return (
      <figure
        key={`${keyPrefix}-${index}`}
        className="lp-film-card"
        style={{
          width: variant.width,
          transform: `translateY(${variant.y}px) rotate(${variant.rotate}deg)`,
        }}
      >
        <div className="lp-film-frame">
          {item.startsWith("ph-") ? (
            <PlaceholderPoster variant={index} />
          ) : isVideoFile(item) ? (
            <video src={item} muted loop playsInline preload="metadata" />
          ) : (
            // Dinamik vitrin görselleri — boyut kart oranından gelir
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item} alt="" width={270} height={480} loading="lazy" />
          )}
        </div>
        <figcaption className="lp-film-caption">
          <span>{label}</span>
          <span className="lp-film-rec">● REC</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="relative">
      <div className="mb-4 px-5 sm:px-8">
        <span
          className="text-sm tracking-[0.3em]"
          style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-red)" }}
        >
          &gt; ARŞİV / SON KAYITLAR
        </span>
      </div>

      <div ref={viewportRef} className="lp-strip select-none" aria-hidden="true">
        <div ref={trackRef} className="lp-strip-track">
          {[0, 1].map((half) =>
            items.map((item, i) => renderCard(item, i, `s${half}`))
          )}
        </div>
      </div>
    </div>
  );
}
