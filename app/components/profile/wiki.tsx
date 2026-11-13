import type { WikiEntry } from "@/lib/wiki";

/** The long read: lead, sections, an infobox and a dated timeline, with the sources it was written from. */
export default function Wiki({ entry, name }: { entry: WikiEntry; name: string }) {
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0">
        <p className="text-lg leading-relaxed">{entry.lead}</p>
        <nav aria-label={`${name} wiki contents`} className="mt-5 flex flex-wrap gap-2">
          {entry.sections.map((s) => (
            <a key={s.id} href={`#wiki-${s.id}`} className="rounded-full border border-line px-3 py-1 text-sm hover:border-brand hover:text-brand">
              {s.title}
            </a>
          ))}
        </nav>
        {entry.sections.map((s) => (
          <section key={s.id} id={`wiki-${s.id}`} className="mt-8 scroll-mt-28">
            <h3 className="display text-2xl">{s.title}</h3>
            {s.paras.map((p, i) => (
              <p key={i} className="mt-3 text-[15px] leading-[1.75] text-ink/90 sm:text-base">
                {p}
              </p>
            ))}
          </section>
        ))}
        <div className="mt-8 border-t border-line pt-4">
          <h3 className="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Written from</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {entry.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
        <div className="rounded-xl bg-mist p-4">
          <h3 className="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">At a glance</h3>
          <dl className="mt-3 space-y-2.5 text-sm">
            {entry.facts.map((f) => (
              <div key={f.label}>
                <dt className="font-mono text-[11px] text-ink-soft">{f.label}</dt>
                <dd className="font-semibold leading-snug">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="font-mono text-xs tracking-[0.12em] text-ink-soft uppercase">Timeline</h3>
          <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
            {entry.timeline.map((t) => (
              <li key={t.date + t.text} className="relative">
                <span className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full bg-brand" />
                <p className="font-mono text-xs text-ink-soft">{t.date}</p>
                <p className="text-sm leading-snug">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
