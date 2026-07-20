/** Saf CSS synthwave karesi — geometrik yer tutucu görsel.
 *  Pipeline "render reveal" sahnesi ve hero feature karesi paylaşır. */
export function SynthFrame({ label = "RENDER %100" }: { label?: string }) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "linear-gradient(to bottom, oklch(0.16 0.02 250) 0%, oklch(0.27 0.04 250) 55%, oklch(0.13 0 0) 55%, oklch(0.16 0.005 250) 100%)",
      }}
    >
      {/* Neon güneş */}
      <div
        className="absolute top-[22%] left-1/2 aspect-square w-[30%] -translate-x-1/2 rounded-full"
        style={{
          background: "linear-gradient(to bottom, var(--lp-red-hot), var(--lp-red-dim))",
          boxShadow: "0 0 40px oklch(0.63 0.26 19 / 0.5)",
        }}
      />
      {/* Ufuk çizgisi */}
      <div
        className="absolute top-[55%] right-0 left-0 h-px"
        style={{ background: "var(--lp-red)", boxShadow: "0 0 12px oklch(0.63 0.26 19 / 0.8)" }}
      />
      {/* Perspektif zemin ızgarası */}
      <div
        className="absolute inset-x-0 top-[55%] bottom-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, oklch(0.63 0.26 19 / 0.35) 0 1px, transparent 1px 22%), repeating-linear-gradient(90deg, oklch(0.63 0.26 19 / 0.2) 0 1px, transparent 1px 12%)",
        }}
      />
      <span
        className="absolute right-4 bottom-3 text-sm tracking-[0.25em]"
        style={{ fontFamily: "var(--lp-font-crt)", color: "var(--lp-ink)" }}
      >
        {label}
      </span>
    </div>
  );
}
