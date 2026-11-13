import Link from "next/link";
import { Logo } from "@/app/components/logo";
import RoverDrive from "@/app/components/rover-drive";
import { ArrowRight } from "@/app/components/icons";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/heroes", label: "Heroes" },
      { href: "/timeline", label: "Timeline" },
      { href: "/where-they-rest", label: "Where they rest" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/videos", label: "Videos" },
      { href: "/series/rovervilla-jr", label: "Rover Villa Jr" },
      { href: "/books", label: "Books" },
      { href: "/games", label: "Games" },
    ],
  },
  {
    title: "Rover Villa",
    links: [
      { href: "/about", label: "About" },
      { href: "/tributes", label: "Tributes" },
    ],
  },
];

/** Site footer: the brand and a way to leave a tribute, every section by group, then the small print. */
export default function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const soft = dark ? "text-white/55" : "text-ink-soft";
  const rule = dark ? "border-white/10" : "border-line";

  return (
    <footer className={dark ? "bg-screen text-white" : "bg-white text-ink"}>
      <RoverDrive dark={dark} />
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid gap-8 pt-8 pb-8 sm:gap-10 sm:pt-12 sm:pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:gap-16 lg:pt-14 lg:pb-14">
          {/* brand */}
          <div>
            {/* phones: logo and the tribute button share a row */}
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-block" aria-label="Rover Villa home">
                <Logo />
              </Link>
              <Link
                href="/tributes"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-[14px] font-semibold text-white transition active:scale-95 sm:hidden"
              >
                Leave a tribute <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="display mt-4 max-w-[18ch] text-[22px] leading-[1.05] sm:mt-5 sm:text-[32px]">
              They never came back. <span className={dark ? "text-brand-glow" : "text-brand"}>So we bring their stories home.</span>
            </p>
            <Link
              href="/tributes"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-brand-deep active:scale-95 max-sm:hidden"
            >
              Leave a tribute <ArrowRight />
            </Link>
          </div>

          {/* every section, grouped */}
          <nav aria-label="Footer" className="grid grid-cols-3 gap-x-4 sm:gap-x-6">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <p className={`font-mono text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em] ${soft}`}>{c.title}</p>
                <ul className="mt-3 space-y-2 sm:mt-3.5 sm:space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={`text-[14px] font-medium transition-colors sm:text-[15px] ${dark ? "hover:text-brand-glow" : "hover:text-brand"}`}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* the small print */}
        <div className={`flex flex-col gap-1.5 border-t py-5 text-[12px] sm:gap-2 sm:py-6 sm:text-[13px] sm:flex-row sm:items-center sm:justify-between ${rule} ${soft}`}>
          <p>© {new Date().getFullYear()} Rover Villa · rovervilla.space</p>
          <p>An independent memorial, not affiliated with or endorsed by any space agency.</p>
        </div>
      </div>
    </footer>
  );
}
