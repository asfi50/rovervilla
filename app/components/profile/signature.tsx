import Image from "next/image";
import type { Signature } from "@/lib/signatures";
import { photo } from "@/lib/photos";

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toLocaleString("en-GB", { maximumFractionDigits: 3 }));

/** The hero's signature section: one bespoke visual built from that machine's own record. */
export default function SignatureBlock({ sig, accent }: { sig: Signature; accent: "mars" | "moon" }) {
  const tone = accent === "mars" ? "text-mars" : "text-brand";
  const fill = accent === "mars" ? "bg-mars" : "bg-brand";

  return (
    <div>
      <h2 className="display text-[32px] sm:text-[40px]">{sig.title}</h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-base">{sig.intro}</p>
      <div className="mt-6">
        {sig.kind === "frames" && (
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {sig.frames.map((f, i) => {
              const p = f.image ? photo(f.image, f.label) : null;
              return (
                <li key={f.label} className="overflow-hidden rounded-xl bg-night text-white">
                  <div className="relative aspect-square">
                    {p ? (
                      <Image src={p.src} alt={p.alt} fill sizes="(min-width:640px) 25vw, 100vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-black">
                        <span className="pulse-ring absolute h-16 w-16 rounded-full border-2 border-white/60" />
                        <span className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold">{f.label}</p>
                    {f.sub && <p className="mt-0.5 text-xs leading-relaxed text-white/75">{f.sub}</p>}
                    {p && (
                      <a href={p.source} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate font-mono text-[10px] text-white/55 hover:text-white">
                        {p.credit}
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {sig.kind === "clock" && (
          <ol className="relative space-y-1 border-l-2 border-line pl-6">
            {sig.events.map((e) => (
              <li key={e.t + e.text} className="relative py-2">
                <span className={`absolute top-4 -left-[31px] h-3 w-3 rounded-full border-2 border-white ${e.big ? fill : "bg-ink-soft"}`} />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className={`shrink-0 font-mono tabular-nums sm:w-28 ${e.big ? `display text-3xl ${tone}` : "text-lg"}`}>{e.t}</span>
                  <span className={`leading-relaxed ${e.big ? "text-base font-semibold" : "text-[15px] text-ink-soft"}`}>{e.text}</span>
                </div>
              </li>
            ))}
          </ol>
        )}

        {sig.kind === "bars" && (
          <ul className="space-y-4">
            {sig.bars.map((b) => {
              const max = Math.max(...sig.bars.map((x) => x.value));
              return (
                <li key={b.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[15px]">{b.label}</span>
                    <span className="display shrink-0 text-2xl tabular-nums">
                      {fmt(b.value)} <span className="font-mono text-xs font-normal text-ink-soft">{sig.unit}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-mist">
                    <div className={`h-full rounded-full ${b.muted ? "bg-ink-soft/40" : fill}`} style={{ width: `${Math.max(1.5, (b.value / max) * 100)}%` }} />
                  </div>
                  {b.note && <p className="mt-1 font-mono text-xs text-ink-soft">{b.note}</p>}
                </li>
              );
            })}
          </ul>
        )}

        {(sig.kind === "stats" || sig.kind === "seismo") && (
          <>
            {sig.kind === "seismo" && <Seismogram className={`mb-5 h-24 w-full ${tone}`} />}
            <ul className={`grid gap-3 ${sig.items.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
              {sig.items.map((s) => (
                <li key={s.label} className="rounded-xl bg-mist p-4">
                  <p className={`display text-3xl ${tone}`}>{s.value}</p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">{s.label}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        {sig.kind === "stats" && sig.compare && (
          <ul className="mt-6 space-y-5">
            {sig.compare.map((c) => (
              <li key={c.label}>
                <p className="font-mono text-xs tracking-[0.1em] text-ink-soft uppercase">{c.label}</p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-3 rounded-full bg-ink-soft/35" style={{ width: `${Math.max(1.5, (c.planned / c.actual) * 100)}%` }} />
                    <span className="shrink-0 text-sm text-ink-soft">{c.plannedText}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 flex-1 rounded-full ${fill}`} />
                    <span className="shrink-0 text-sm font-semibold">{c.actualText}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {sig.kind === "sequence" && (
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sig.steps.map((s, i) => (
              <li key={s.label} className="relative rounded-xl border border-line bg-white p-4">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs text-white ${fill}`}>{i + 1}</span>
                <p className="mt-3 font-mono text-xs text-ink-soft">{s.label}</p>
                <p className="mt-1 text-[15px] leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/** A drawn seismogram: quiet line, then a quake. An illustration, not InSight data. */
function Seismogram({ className = "" }: { className?: string }) {
  const pts: string[] = [];
  for (let i = 0; i <= 400; i++) {
    const x = i * 2.5;
    const quake = i > 170 && i < 300 ? Math.exp(-((i - 190) ** 2) / 900) * 1 + Math.exp(-((i - 230) ** 2) / 2500) * 0.55 : 0;
    const noise = Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.53) * 0.4 + Math.sin(i * 3.1) * 0.3;
    pts.push(`${x.toFixed(1)},${(50 + noise * (2 + quake * 34)).toFixed(1)}`);
  }
  return (
    <figure>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={className} aria-hidden>
        <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="font-mono text-[11px] text-ink-soft">Illustration of a seismogram, not InSight data.</figcaption>
    </figure>
  );
}
