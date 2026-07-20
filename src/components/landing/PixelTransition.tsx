"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
// Overlay stilleri: doğrudan girişlerde de (ör. /giris) yüklü olmalı
import "./landing.css";

const COLS = 14;
const ROWS = 8;
const RED_RATIO = 0.15;
const COVER_DURATION = 0.4;
const REVEAL_DURATION = 0.3;

interface PixelTransitionApi {
  navigate: (href: string) => void;
}

const PixelTransitionContext = createContext<PixelTransitionApi | null>(null);

export function usePixelTransition(): PixelTransitionApi {
  const ctx = useContext(PixelTransitionContext);
  if (!ctx) {
    throw new Error("usePixelTransition, PixelTransitionProvider içinde kullanılmalı");
  }
  return ctx;
}

/** Kare rengi deterministik: hydration uyumsuzluğu olmasın diye pseudo-random */
function isRedCell(index: number): boolean {
  const hash = Math.sin(index * 127.1) * 43758.5453;
  return hash - Math.floor(hash) < RED_RATIO;
}

/** Sütun bazlı dalga gecikmesi üreticisi: soldan sağa + satıra sinüs ofseti.
 *  Dönen fonksiyon gsap `stagger` olarak kullanılır (per-target delay). */
export function makeWaveDelay(cols: number) {
  return (index: number): number => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    return col * 0.028 + Math.sin(row * 0.9 + col * 0.35) * 0.045 + 0.045;
  };
}

const waveDelay = makeWaveDelay(COLS);

/**
 * Sidewave piksel geçişi: ekranı soldan süpüren piksel-blok dalgası.
 * navigate(href) → kareler ekranı kaplar → route değişir → ters dalga.
 * Route değişimini yakalayabilmek için layout seviyesinde yaşar.
 */
export function PixelTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const isCoveredRef = useRef(false);

  const navigate = useCallback(
    (href: string) => {
      const cells = overlayRef.current?.children;
      if (!cells || isCoveredRef.current) return;

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        router.push(href);
        return;
      }

      isCoveredRef.current = true;
      gsap.to(cells, {
        scale: 1.02,
        duration: COVER_DURATION,
        ease: "power2.in",
        stagger: waveDelay,
        onComplete: () => router.push(href),
      });
    },
    [router]
  );

  // Yeni route geldiğinde: ters dalga ile aç (çıkış girişten hızlı)
  useEffect(() => {
    if (!isCoveredRef.current) return;
    const cells = overlayRef.current?.children;
    if (!cells) return;

    gsap.to(cells, {
      scale: 0,
      duration: REVEAL_DURATION,
      ease: "power2.out",
      stagger: waveDelay,
      onComplete: () => {
        isCoveredRef.current = false;
      },
    });
  }, [pathname]);

  const cellColors = useMemo(
    () => Array.from({ length: COLS * ROWS }, (_, i) => isRedCell(i)),
    []
  );

  const api = useMemo(() => ({ navigate }), [navigate]);

  return (
    <PixelTransitionContext.Provider value={api}>
      {children}
      <div
        ref={overlayRef}
        className="lp-pixel-overlay"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
        aria-hidden="true"
      >
        {cellColors.map((isRed, i) => (
          <div
            key={i}
            className={`lp-pixel-cell${isRed ? " lp-pixel-cell--red" : ""}`}
          />
        ))}
      </div>
    </PixelTransitionContext.Provider>
  );
}

interface PixelLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

/** Piksel dalga ile gezinen bağlantı; hash linklerde normal davranır */
export function PixelLink({ href, onClick, children, ...rest }: PixelLinkProps) {
  const { navigate } = usePixelTransition();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || href.startsWith("#")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(href);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
