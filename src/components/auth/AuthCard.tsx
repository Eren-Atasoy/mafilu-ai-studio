import { NeonSign } from "@/components/landing/NeonSign";
import { PixelLink } from "@/components/landing/PixelTransition";
import "@/components/landing/landing.css";

interface AuthCardProps {
  title: string;
  subtitle: string;
  /** Terminal başlık çubuğundaki işlem etiketi, ör. "OTURUM_AÇ" */
  operation: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: React.ReactNode;
}

/**
 * "The Void" auth kabuğu: zift zemin + tarama çizgileri, ortada
 * terminal penceresi. Landing ile aynı token/bileşen dili.
 */
export function AuthCard({
  title,
  subtitle,
  operation,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  children,
}: AuthCardProps) {
  return (
    <main className="landing relative flex min-h-svh flex-col items-center justify-center gap-8 p-4">
      <div className="lp-scanlines" />

      <PixelLink href="/" className="relative z-10 text-2xl tracking-[0.06em]">
        <NeonSign variant="static" />
      </PixelLink>

      <div className="lp-panel relative z-10 w-full max-w-sm">
        {/* Terminal başlık çubuğu */}
        <div
          className="flex items-center justify-between border-b px-4 py-2.5 text-xs tracking-[0.2em]"
          style={{ borderColor: "var(--lp-line)", fontFamily: "var(--lp-font-crt)" }}
        >
          <span style={{ color: "var(--lp-ink-dim)" }}>
            MAFILU_TERMINAL // {operation}
          </span>
          <span style={{ color: "var(--lp-red)" }}>● GÜVENLİ</span>
        </div>

        <div className="p-6">
          <h1 className="text-xl font-semibold" style={{ color: "var(--lp-ink)" }}>
            {title}
          </h1>
          <p className="mt-1 mb-6 text-sm" style={{ color: "var(--lp-ink-dim)" }}>
            {subtitle}
          </p>

          {children}

          <p
            className="mt-6 flex items-baseline justify-center gap-3 text-sm"
            style={{ color: "var(--lp-ink-dim)" }}
          >
            {footerText}
            <PixelLink href={footerLinkHref} className="lp-nav-link text-sm">
              <span className="lp-nav-bracket" aria-hidden="true">[</span>
              {footerLinkLabel}
              <span className="lp-nav-bracket" aria-hidden="true">]</span>
            </PixelLink>
          </p>
        </div>
      </div>
    </main>
  );
}
