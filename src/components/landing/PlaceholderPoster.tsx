import { SynthFrame } from "./SynthFrame";

const VARIANT_COUNT = 8;

/**
 * Vitrin yer tutucu posterleri — tamamı palet token'larından üretilen
 * sentetik kompozisyonlar (dış görsel yok). public/showcase'e gerçek
 * dosya atılınca ShowcaseWall bunları otomatik bırakır.
 */
export function PlaceholderPoster({ variant }: { variant: number }) {
  const v = ((variant % VARIANT_COUNT) + VARIANT_COUNT) % VARIANT_COUNT;

  switch (v) {
    case 0:
      return <SynthFrame label="ARŞİV_01" />;

    case 1: // Şehir silueti — dikey bloklar + kırmızı ufuk
      return (
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(to top, oklch(0.1 0 0) 0 34%, transparent 34%), repeating-linear-gradient(90deg, oklch(0.27 0.04 250) 0 14%, oklch(0.2 0.025 250) 14% 22%, oklch(0.32 0.05 250) 22% 38%, oklch(0.16 0.02 250) 38% 52%), linear-gradient(to bottom, oklch(0.13 0 0), oklch(0.27 0.04 250))",
          }}
        >
          <div
            className="relative top-[66%] h-px w-full"
            style={{ background: "var(--lp-red)", boxShadow: "0 0 10px oklch(0.63 0.26 19 / 0.8)" }}
          />
        </div>
      );

    case 2: // Glitch barları
      return (
        <div
          className="h-full w-full"
          style={{
            background:
              "repeating-linear-gradient(to bottom, oklch(0.1 0 0) 0 12%, oklch(0.63 0.26 19 / 0.85) 12% 15%, oklch(0.16 0.005 250) 15% 34%, oklch(0.4 0.055 250 / 0.7) 34% 37%, oklch(0.13 0 0) 37% 58%, oklch(0.91 0 0 / 0.55) 58% 59.5%, oklch(0.1 0 0) 59.5% 100%)",
          }}
        />
      );

    case 3: // Sinyal yok — parazit
      return (
        <div className="relative h-full w-full" style={{ background: "oklch(0.16 0 0)" }}>
          <div className="lp-static absolute inset-0 opacity-50" />
          <span
            className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em]"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            SİNYAL YOK
          </span>
        </div>
      );

    case 4: // Neon başlık kartı
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2"
          style={{
            background: "oklch(0.11 0 0)",
            boxShadow: "inset 0 0 0 1px oklch(0.45 0.17 19), inset 0 0 24px oklch(0.63 0.26 19 / 0.2)",
          }}
        >
          <span
            className="text-xl leading-tight"
            style={{ fontFamily: "var(--lp-font-display)", color: "var(--lp-red)", textShadow: "0 0 14px oklch(0.63 0.26 19 / 0.6)" }}
          >
            GECE
            <br />
            SEANSI
          </span>
          <span
            className="text-[0.6rem] tracking-[0.35em]"
            style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink-dim)" }}
          >
            MAFILU SUNAR
          </span>
        </div>
      );

    case 5: // Lacivert duotone + kırmızı disk
      return (
        <div
          className="relative h-full w-full"
          style={{ background: "linear-gradient(160deg, oklch(0.4 0.055 250), oklch(0.16 0.02 250) 70%)" }}
        >
          <div
            className="absolute top-[18%] right-[14%] aspect-square w-[38%] rounded-full"
            style={{ background: "var(--lp-red)", boxShadow: "0 0 26px oklch(0.63 0.26 19 / 0.55)" }}
          />
          <div
            className="absolute bottom-[16%] left-[12%] h-px w-[55%]"
            style={{ background: "oklch(0.91 0 0 / 0.5)" }}
          />
        </div>
      );

    case 6: // Test kartı — dikey renk barları
      return (
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.91 0 0) 0 14%, oklch(0.63 0.26 19) 14% 28%, oklch(0.4 0.055 250) 28% 42%, oklch(0.32 0 0) 42% 56%, oklch(0.45 0.17 19) 56% 70%, oklch(0.27 0.04 250) 70% 84%, oklch(0.13 0 0) 84% 100%)",
          }}
        />
      );

    default: // 7: Sinyal halkaları
      return (
        <div
          className="h-full w-full"
          style={{
            background:
              "repeating-radial-gradient(circle at 50% 42%, oklch(0.63 0.26 19 / 0.5) 0 2px, transparent 2px 18px), radial-gradient(circle at 50% 42%, oklch(0.3 0.09 19) 0 6%, oklch(0.11 0 0) 60%)",
          }}
        />
      );
  }
}
