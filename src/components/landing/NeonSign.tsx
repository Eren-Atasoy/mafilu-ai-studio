const SIGN_TEXT = "MAFILU";
/** İkinci "A" bozuk — aralıklı yanıp söner (fsociety tabelası gibi) */
const BROKEN_INDEX = 3;

interface NeonSignProps {
  /** static: flicker'sız küçük tabela (nav/logo) */
  variant?: "hero" | "static";
  className?: string;
}

/**
 * Bozuk neon MAFILU tabelası. Her harf iki katman: sönük tüp (::before)
 * + yanan metin (.lp-neon-lit, yalnızca opacity anime edilir).
 * Server-safe: animasyonlar tamamen CSS'te.
 */
export function NeonSign({ variant = "hero", className }: NeonSignProps) {
  return (
    <span
      className={`${variant === "static" ? "lp-neon--static " : ""}inline-block whitespace-nowrap${className ? ` ${className}` : ""}`}
    >
      {SIGN_TEXT.split("").map((letter, i) => (
        <span
          key={i}
          data-letter={letter}
          className={`lp-neon-letter${
            variant === "hero" && i === BROKEN_INDEX
              ? " lp-neon-letter--broken"
              : ""
          }`}
        >
          <span className="lp-neon-lit">{letter}</span>
        </span>
      ))}
    </span>
  );
}
